const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const existingUser = users.some(user => user.username === username);

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });

  return res.status(201).json({ message: "User successfully registered" });
});


public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  const endpoint = `http://localhost:5000/isbn/${isbn}`;
  
  try {
    const response = await axios.get(endpoint);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

public_users.get("/async/author/:author", async (req, res)=> {
  const author = encodeURIComponent(req.params.author);
  const endpoint = `http://localhost:5000/author/${author}`;
  
  try {
    const response = await axios.get(endpoint);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

})

public_users.get("/async/title/:title", async (req, res)=> {
  const title = encodeURIComponent(req.params.title);
  const endpoint = `http://localhost:5000/title/${title}`;
  
  try {
    const response = await axios.get(endpoint);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

})






// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
    res.send(JSON.stringify(books, null, 4));
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

  const isbn = req.params.isbn;
  
  const book = books[isbn];
  
    if(book){
      res.status(200).json(book);
    } else {
      res.status(404).json({message: "Book Not Found"});
    }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  
  const author = decodeURIComponent(req.params.author);
  
  let filteredBooks = [];
  const keys= Object.keys(books);

    keys.forEach((key)=> {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        filteredBooks.push({isbn : key, ...books[key]});
      }
    });
     if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
    } else {
        res.status(404).json({ message: "No books found for this     author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  
  const title = decodeURIComponent(req.params.title);
  
  const keys = Object.keys(books);
  let filteredBooks =[];
  

  keys.forEach((key)=> {
    if (books[key].title.toLowerCase() === title.toLowerCase()){
      filteredBooks.push({ isbn : key, ...books[key] });
    }
  });
  if (filteredBooks.length > 0){
    res.status(200).json(filteredBooks);
  } else {
    res.status(404).json({ message : "No BOoks Found with this title."})
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book){
    res.status(200).json(book.reviews);
  }else{
    res.status(404).json({message: "Book not Found"});
  }
});

module.exports.general = public_users;
