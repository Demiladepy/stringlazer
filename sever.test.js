const request = require('supertest');
const app = require('./server');

describe('String Analyzer Service API', () => {
  
  describe('POST /strings', () => {
    it('should create and analyze a new string', async () => {
      const response = await request(app)
        .post('/strings')
        .send({ value: 'Hello World' })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('value', 'Hello World');
      expect(response.body).toHaveProperty('properties');
      expect(response.body.properties.length).toBe(11);
      expect(response.body.properties.word_count).toBe(2);
      expect(response.body.properties.is_palindrome).toBe(false);
    });
    
    it('should return 409 for duplicate string', async () => {
      await request(app)
        .post('/strings')
        .send({ value: 'test string' });
      
      await request(app)
        .post('/strings')
        .send({ value: 'test string' })
        .expect(409);
    });
    
    it('should return 400 for missing value field', async () => {
      await request(app)
        .post('/strings')
        .send({})
        .expect(400);
    });
    
    it('should return 422 for non-string value', async () => {
      await request(app)
        .post('/strings')
        .send({ value: 12345 })
        .expect(422);
    });
    
    it('should correctly identify palindromes', async () => {
      const response = await request(app)
        .post('/strings')
        .send({ value: 'racecar' })
        .expect(201);
      
      expect(response.body.properties.is_palindrome).toBe(true);
    });
    
    it('should correctly count unique characters', async () => {
      const response = await request(app)
        .post('/strings')
        .send({ value: 'aabbcc' })
        .expect(201);
      
      expect(response.body.properties.unique_characters).toBe(3);
    });
    
    it('should generate correct character frequency map', async () => {
      const response = await request(app)
        .post('/strings')
        .send({ value: 'hello' })
        .expect(201);
      
      expect(response.body.properties.character_frequency_map).toEqual({
        h: 1,
        e: 1,
        l: 2,
        o: 1
      });
    });
  });
  
  describe('GET /strings/:string_value', () => {
    beforeEach(async () => {
      await request(app)
        .post('/strings')
        .send({ value: 'test retrieval' });
    });
    
    it('should retrieve an existing string', async () => {
      const response = await request(app)
        .get('/strings/test%20retrieval')
        .expect(200);
      
      expect(response.body.value).toBe('test retrieval');
      expect(response.body).toHaveProperty('properties');
    });
    
    it('should return 404 for non-existent string', async () => {
      await request(app)
        .get('/strings/nonexistent')
        .expect(404);
    });
  });
  
  describe('GET /strings', () => {
    beforeEach(async () => {
      await request(app).post('/strings').send({ value: 'racecar' });
      await request(app).post('/strings').send({ value: 'hello world' });
      await request(app).post('/strings').send({ value: 'a' });
    });
    
    it('should return all strings without filters', async () => {
      const response = await request(app)
        .get('/strings')
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should filter by is_palindrome', async () => {
      const response = await request(app)
        .get('/strings?is_palindrome=true')
        .expect(200);
      
      expect(response.body.data.every(s => s.properties.is_palindrome)).toBe(true);
    });
    
    it('should filter by min_length', async () => {
      const response = await request(app)
        .get('/strings?min_length=5')
        .expect(200);
      
      expect(response.body.data.every(s => s.properties.length >= 5)).toBe(true);
    });
    
    it('should filter by word_count', async () => {
      const response = await request(app)
        .get('/strings?word_count=2')
        .expect(200);
      
      expect(response.body.data.every(s => s.properties.word_count === 2)).toBe(true);
    });
    
    it('should filter by contains_character', async () => {
      const response = await request(app)
        .get('/strings?contains_character=a')
        .expect(200);
      
      expect(response.body.data.every(s => s.value.includes('a'))).toBe(true);
    });
    
    it('should return 400 for invalid filter parameters', async () => {
      await request(app)
        .get('/strings?min_length=invalid')
        .expect(400);
    });
  });
  
  describe('GET /strings/filter-by-natural-language', () => {
    beforeEach(async () => {
      await request(app).post('/strings').send({ value: 'racecar' });
      await request(app).post('/strings').send({ value: 'noon' });
      await request(app).post('/strings').send({ value: 'hello world' });
    });
    
    it('should parse "single word palindromic strings"', async () => {
      const response = await request(app)
        .get('/strings/filter-by-natural-language?query=single%20word%20palindromic%20strings')
        .expect(200);
      
      expect(response.body.interpreted_query.parsed_filters).toEqual({
        word_count: 1,
        is_palindrome: true
      });
    });
    
    it('should parse "strings longer than 10 characters"', async () => {
      const response = await request(app)
        .get('/strings/filter-by-natural-language?query=strings%20longer%20than%2010%20characters')
        .expect(200);
      
      expect(response.body.interpreted_query.parsed_filters).toHaveProperty('min_length', 11);
    });
    
    it('should parse "strings containing the letter a"', async () => {
      const response = await request(app)
        .get('/strings/filter-by-natural-language?query=strings%20containing%20the%20letter%20a')
        .expect(200);
      
      expect(response.body.interpreted_query.parsed_filters).toHaveProperty('contains_character', 'a');
    });
    
    it('should return 400 for unparseable query', async () => {
      await request(app)
        .get('/strings/filter-by-natural-language?query=gibberish')
        .expect(400);
    });
  });
  
  describe('DELETE /strings/:string_value', () => {
    beforeEach(async () => {
      await request(app)
        .post('/strings')
        .send({ value: 'delete me' });
    });
    
    it('should delete an existing string', async () => {
      await request(app)
        .delete('/strings/delete%20me')
        .expect(204);
      
      await request(app)
        .get('/strings/delete%20me')
        .expect(404);
    });
    
    it('should return 404 for non-existent string', async () => {
      await request(app)
        .delete('/strings/nonexistent')
        .expect(404);
    });
  });
  
  describe('GET /', () => {
    it('should return service information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
});