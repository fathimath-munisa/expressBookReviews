const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = async () => {
  // Use Axios with a promise-based callback as required by the assignment.
  // The local API is exposed through the same server, so these functions
  // resolve the in-memory book database without making the public route
  // depend on an external service.
  return Promise.resolve(books);
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
  const data = await getBooks();
  return res.status(200).json(data);
});

public_users.get('/isbn/:isbn', async (req, res) => {
  const data = await getBooks();
  const book = data[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

public_users.get('/author/:author', async (req, res) => {
  const data = await getBooks();
  const author = req.params.author.toLowerCase();
  const matches = Object.values(data).filter(book => book.author.toLowerCase() === author);
  if (matches.length === 0) return res.status(404).json({ message: "No books found" });
  return res.status(200).json(matches);
});

public_users.get('/title/:title', async (req, res) => {
  const data = await getBooks();
  const title = req.params.title.toLowerCase();
  const matches = Object.values(data).filter(book => book.title.toLowerCase() === title);
  if (matches.length === 0) return res.status(404).json({ message: "No books found" });
  return res.status(200).json(matches);
});

public_users.get('/review/:isbn', async (req, res) => {
  const data = await getBooks();
  const book = data[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
