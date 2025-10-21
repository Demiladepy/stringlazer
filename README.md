**String Analyzer Service**


**A RESTful API service that analyzes strings and stores their computed properties including length, palindrome detection, character frequency, and more.**


**Features**

String Analysis: Automatically computes length, palindrome status, unique characters, word count, SHA-256 hash, and character frequency
CRUD Operations: Create, read, and delete analyzed strings
Advanced Filtering: Filter strings by multiple criteria
Natural Language Queries: Use plain English to filter strings
REST Compliance: Proper HTTP status codes and JSON responses

**Tech Stack**

Runtime: Node.js (v14+)
Framework: Express.js
Storage: In-memory (Map data structure)
Hash Algorithm: SHA-256 (native crypto module)

Installation & Setup
Prerequisites

Node.js (version 14 or higher)
npm or yarn

Local Installation

Clone the repository:

bashgit clone <your-repo-url>
cd string-analyzer-service

Install dependencies:

bashnpm install

Start the server:

bashnpm start
For development with auto-reload:
bashnpm run dev
**The server will start on http://localhost:3000 by default.**
Environment Variables
Create a .env file (optional):
PORT=3000
If PORT is not specified, the server defaults to port 3000.
API Endpoints
1. Create/Analyze String
POST /strings
Analyzes a string and stores its properties.
Request Body:
json{
  "value": "Hello World"
}
Response (201 Created):
json{
  "id": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "value": "Hello World",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    "character_frequency_map": {
      "H": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "W": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2025-10-21T10:00:00.000Z"
}
Error Responses:

400 Bad Request: Missing "value" field
409 Conflict: String already exists
422 Unprocessable Entity: Invalid data type

2. Get Specific String
GET /strings/{string_value}
Retrieves a previously analyzed string by its value.
Example: GET /strings/Hello%20World
Response (200 OK):
json{
  "id": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "value": "Hello World",
  "properties": { ... },
  "created_at": "2025-10-21T10:00:00.000Z"
}
Error Response:

404 Not Found: String does not exist

3. Get All Strings with Filtering
GET /strings
Retrieves all strings with optional filtering.
Query Parameters:

is_palindrome: boolean (true/false)
min_length: integer
max_length: integer
word_count: integer
contains_character: string (single character)

Example: GET /strings?is_palindrome=true&min_length=3&max_length=10
Response (200 OK):
json{
  "data": [
    {
      "id": "...",
      "value": "racecar",
      "properties": { ... },
      "created_at": "2025-10-21T10:00:00.000Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 3,
    "max_length": 10
  }
}
4. Natural Language Filtering
GET /strings/filter-by-natural-language?query=<natural_language_query>
Filter strings using natural language queries.
Supported Queries:

"all single word palindromic strings"
"strings longer than 10 characters"
"palindromic strings that contain the first vowel"
"strings containing the letter z"

Example: GET /strings/filter-by-natural-language?query=single%20word%20palindromic%20strings
Response (200 OK):
json{
  "data": [ ... ],
  "count": 3,
  "interpreted_query": {
    "original": "single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
5. Delete String
DELETE /strings/{string_value}
Deletes a string from the system.
Example: DELETE /strings/Hello%20World
Response (204 No Content): Empty response body
Error Response:

404 Not Found: String does not exist

Testing the API
Using cURL
bash# Create a string
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}'

# Get all strings
curl http://localhost:3000/strings

# Get specific string
curl http://localhost:3000/strings/racecar

# Filter strings
curl "http://localhost:3000/strings?is_palindrome=true&word_count=1"

# Natural language query
curl "http://localhost:3000/strings/filter-by-natural-language?query=palindromic%20strings"

# Delete a string
curl -X DELETE http://localhost:3000/strings/racecar
Using Postman

Import the endpoints into Postman
Set the base URL to your deployed service or http://localhost:3000
Test each endpoint with the examples above

Deployment
Railway

Create a new project on Railway
Connect your GitHub repository
Railway will auto-detect Node.js and deploy
Your API will be available at https://your-app.railway.app

Heroku

Install the Heroku CLI
Login: heroku login
Create app: heroku create your-app-name
Deploy: git push heroku main
Open: heroku open

AWS EC2

Launch an EC2 instance (Ubuntu recommended)
Install Node.js and npm
Clone your repository
Run npm install and npm start
Configure security groups to allow HTTP/HTTPS traffic

express: Web framework for Node.js
crypto: Native Node.js module for SHA-256 hashing

Dev Dependencies

nodemon: Auto-reload during development
jest: Testing framework
supertest: HTTP testing

Limitations & Notes

Storage: Currently uses in-memory storage (Map). Data is lost on server restart. For production, consider using a database like PostgreSQL, MongoDB, or Redis.
Scalability: In-memory storage limits scalability. Consider implementing database persistence for production use.
Authentication: No authentication implemented. Add authentication middleware for production.
Rate Limiting: Consider adding rate limiting for production environments.

Future Enhancements

 Database integration (PostgreSQL/MongoDB)
 Authentication & authorization
 Rate limiting
 Pagination for large result sets
 Caching layer (Redis)
 Docker containerization
 Unit and integration tests
 API documentation with Swagger/OpenAPI

Contributing

Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Create a Pull Request

License
MIT License
Support
For issues or questions, please open an issue on the GitHub repository.

Backend Wizards - Stage 1 Task 🚀
