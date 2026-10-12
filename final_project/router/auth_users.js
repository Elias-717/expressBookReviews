const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string" ||
      !authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid username or password"});
  }

  const accessToken = jwt.sign({username}, "access", {expiresIn: "1h"});
  req.session.authorization = {username, accessToken};

  return res.status(200).json({
    message: "User successfully logged in",
    accessToken
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  const review = req.query.review;
  const username = req.user && req.user.username;

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  if (typeof review !== "string" || !review.trim()) {
    return res.status(400).json({message: "Review is required"});
  }

  book.reviews[username] = review;
  return res.status(200).json({message: "Review successfully posted"});
});

// Delete the logged-in user's review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  const username = req.user && req.user.username;

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({message: "Review not found"});
  }

  delete book.reviews[username];
  return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
