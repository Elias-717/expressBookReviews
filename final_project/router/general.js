const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = (req) => {
  return axios.get(`${req.protocol}://${req.get("host")}/api/books`);
};


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || !username.trim() ||
      typeof password !== "string" || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (!isValid(username)) {
    return res.status(409).json({message: "Username already exists"});
  }

  users.push({username, password});
  return res.status(201).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await getBooks(req);
    res.send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    res.status(500).json({message: "Unable to retrieve books"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const response = await getBooks(req);
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({message: "Book not found"});
    }

    res.send(JSON.stringify(book, null, 2));
  } catch (error) {
    res.status(500).json({message: "Unable to retrieve books"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const response = await getBooks(req);
    const author = req.params.author;
    const matchingBooks = {};

    Object.keys(response.data).forEach((isbn) => {
      if (response.data[isbn].author === author) {
        matchingBooks[isbn] = response.data[isbn];
      }
    });

    res.send(JSON.stringify(matchingBooks, null, 2));
  } catch (error) {
    res.status(500).json({message: "Unable to retrieve books"});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const response = await getBooks(req);
    const title = req.params.title;
    const matchingBooks = {};

    Object.keys(response.data).forEach((isbn) => {
      if (response.data[isbn].title === title) {
        matchingBooks[isbn] = response.data[isbn];
      }
    });

    res.send(JSON.stringify(matchingBooks, null, 2));
  } catch (error) {
    res.status(500).json({message: "Unable to retrieve books"});
  }
});

public_users.get('/api/books', function (req, res) {
  res.json(books);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  res.send(JSON.stringify(book.reviews, null, 2));
});

module.exports.general = public_users;
