//jshint esversion:6
const express = require('express');
const mongoose = require('mongoose'); 
const ejs = require('ejs'); 
const encrypt = require('mongoose-encryption'); 
const bodyParser = require('body-parser'); 

// connect mongodD with Mongoose
// Initialize App with Express
const app = new express(); 

// Deploy ejs
app.set("view engine", "ejs");
// Deploy Body-parser 
app.use(bodyParser.urlencoded({extended : true})); 
// Express
app.use(express.static("public"))

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
}); 

app.get("/register", function(req, res){
    res.render("register");
}); 

app.listen(3000, function(){
    console.log("Server started on port 3000!");
});