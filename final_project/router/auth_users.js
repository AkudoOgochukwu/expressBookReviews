const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}


//write code to check if username and password match the one we have in records.
const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in. Missing username or password." });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Save it in the session
        req.session.authorization = {
            accessToken, username
        };
        
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

   
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
    const review = req.query.review; // The review is sent as a query parameter
    const username = req.session.authorization['username']; // Get the user from the session

    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated.` });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username']; // Get the user from the session

    // Check if the book exists and if the user has a review for it
    if (books[isbn] && books[isbn].reviews[username]) {
        // Delete the review
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.` });
    } else {
        return res.status(404).json({ message: "Review not found or user not authorized" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
