//jshint esversion:6
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); 
const ejs = require('ejs'); 
const bodyParser = require('body-parser'); 
const md5 = require('md5');

// connect mongodD with Mongoose
main().catch(err => console.log(err));
async function main(){
        await mongoose.connect(process.env.DB_HOST);
}

// Define Schema 
const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

// Initialize collection
const User = new mongoose.model('User', userSchema);

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

app.post("/register", function(req, res){
    const newUser = new User({
        email : req.body.username, 
        password : md5(req.body.password)
    });
    newUser.save();
    res.render("secrets");
}); 

app.post("/login", async function(req, res){
    const email = req.body.username; 
    const password = md5(req.body.password); 

    const userInfo = await User.findOne({email : email});

    if (userInfo != null){
            if(userInfo.password === password)
                res.render("secrets");
            else
                res.render("login");
    }
    else 
        res.render("login"); // Password Incorrect;
});

app.listen(3000, function(){
    console.log("Server started on port 3000!");
});