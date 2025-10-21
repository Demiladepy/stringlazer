import express from "express";
import crypto from "crypto";
import cors from "cors";
import dayjs from "dayjs";

const app = express();
app.use(express.json());
app.use(cors());

// In-memory storage (for testing)
const strings = new Map();

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "String Analyzer Service API",
    status: "running",
    endpoints: [
      "POST /strings",
      "GET /strings/:string_value",
      "GET /strings",
      "GET /strings/filter-by-natural-language",
      "DELETE /strings/:string_value",
    ],
  });
});

// Utility function to analyze a string
function analyzeString(value) {
  const length = value.length;
  const is_palindrome =
    value.toLowerCase() === value.toLowerCase().split("").reverse().join("");
  const unique_characters = new Set(value).size;
  const word_count = value.trim().split(/\s+/).length;
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");
  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] =
      (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

// POST /strings — Create/Analyze String
app.post("/strings", (req, res) => {
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: "Missing 'value' field" });
  }
  if (typeof value !== "string") {
    return res.status(400).json({ error: "Invalid data type for 'value'" });
  }

  const id = crypto.createHash("sha256").update(value).digest("hex");
  if (strings.has(id)) {
    return res.status(409).json({ error: "String already exists" });
  }

  const properties = analyzeString(value);
  const data = {
    id,
    value,
    properties,
    created_at: dayjs().toISOString(),
  };

  strings.set(id, data);
  return res.status(201).json(data);
});

// GET /strings/:string_value — Retrieve by exact value
app.get("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;
  const hash = crypto.createHash("sha256").update(string_value).digest("hex");

  if (!strings.has(hash)) {
    return res.status(404).json({ error: "String not found" });
  }

  res.status(200).json(strings.get(hash));
});

// GET /strings — Get all with filters
app.get("/strings", (req, res) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;

  let results = Array.from(strings.values());

  if (is_palindrome !== undefined)
    results = results.filter(
      (s) => s.properties.is_palindrome === (is_palindrome === "true")
    );
  if (min_length)
    results = results.filter((s) => s.properties.length >= parseInt(min_length));
  if (max_length)
    results = results.filter((s) => s.properties.length <= parseInt(max_length));
  if (word_count)
    results = results.filter(
      (s) => s.properties.word_count === parseInt(word_count)
    );
  if (contains_character)
    results = results.filter((s) => s.value.includes(contains_character));

  res.status(200).json({
    data: results,
    count: results.length,
    filters_applied: {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    },
  });
});

// GET /strings/filter-by-natural-language
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }

  let results = Array.from(strings.values());

  if (query.includes("longer than")) {
    const num = parseInt(query.split("longer than")[1]);
    results = results.filter((s) => s.properties.length > num);
  } else if (query.includes("shorter than")) {
    const num = parseInt(query.split("shorter than")[1]);
    results = results.filter((s) => s.properties.length < num);
  } else if (query.includes("palindrome")) {
    results = results.filter((s) => s.properties.is_palindrome);
  }

  return res.status(200).json({ data: results, count: results.length });
});

// DELETE /strings/:string_value — Delete string
app.delete("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;
  const hash = crypto.createHash("sha256").update(string_value).digest("hex");

  if (!strings.has(hash)) {
    return res.status(404).json({ error: "String not found" });
  }

  strings.delete(hash);
  return res.status(200).json({ message: "Deleted successfully" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

export default app;
