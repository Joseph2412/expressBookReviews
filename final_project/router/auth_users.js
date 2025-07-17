const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ 
  return users.some (user => user.username === username && user.password === password);
}


//Debug Rout for Knowing whic user are registred
regd_users.get("/debug/users", (req, res) => {
  res.json(users);
});

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password} = req.body;
  
  if (!username || !password){
    return res.status(400).json({message : "Username and Password REQUIRED"});
  }

  if (!authenticatedUser (username, password)){
    return res.status(401).json({ message : "Invalid Credentials"});
  }

  let accessToken = jwt.sign({ username }, "access", {expiresIn:60*60});
  req.session.authorization = {accessToken , username};
  return res.status(200).json({ message :"Login Succesful", token:accessToken});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review || req.query.review;
  const username = req.session.authorization && req.session.authorization.username;

  if (!username) {
    return res.status(401).json({ message: "User NOT AUTHENTICATED" });
  }
  if (!review) {
    return res.status(400).json({ message: "REVIEW IS REQUIRED" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book NOT FOUND" });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
