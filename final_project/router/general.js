const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Internal data endpoint used by the Axios-based retrieval functions below.
public_users.get('/api/books-data', (req, res) => {
  return res.status(200).json(books);
});

// Retrieve all books using Axios and async/await.
const getAllBooks = async () => {
  const response = await axios.get('http://localhost:5000/api/books-data');
  return response.data;
};

// Retrieve a book by ISBN using Axios and async/await.
const getBookByISBN = async (isbn) => {
  const response = await axios.get('http://localhost:5000/api/books-data');
  return response.data[isbn];
};

// Retrieve books by author using Axios and async/await.
const getBooksByAuthor = async (author) => {
  const response = await axios.get('http://localhost:5000/api/books-data');
  const normalizedAuthor = author.toLowerCase();
  return Object.values(response.data).filter(
    (book) => book.author.toLowerCase() === normalizedAuthor
  );
};

// Retrieve books by title using Axios and async/await.
const getBooksByTitle = async (title) => {
  const response = await axios.get('http://localhost:5000/api/books-data');
  const normalizedTitle = title.toLowerCase();
  return Object.values(response.data).filter(
    (book) => book.title.toLowerCase() === normalizedTitle
  );
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

public_users.get('/', async (req, res) => {
  try {
    const data = await getAllBooks();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books" });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const book = await getBookByISBN(req.params.isbn);
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books" });
  }
});

public_users.get('/author/:author', async (req, res) => {
  try {
    const matches = await getBooksByAuthor(req.params.author);
    if (matches.length === 0) return res.status(404).json({ message: "No books found" });
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books" });
  }
});

public_users.get('/title/:title', async (req, res) => {
  try {
    const matches = await getBooksByTitle(req.params.title);
    if (matches.length === 0) return res.status(404).json({ message: "No books found" });
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books" });
  }
});

public_users.get('/review/:isbn', async (req, res) => {
  try {
    const book = await getBookByISBN(req.params.isbn);
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve reviews" });
  }
});

module.exports.general = public_users;
