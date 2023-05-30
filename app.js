//jshint esversion:6
const express = require('express');
const mongoose = require('mongoose'); 
const ejs = require('ejs'); 
const encrypt = require('mongoose-encryption'); ``
const bodyParser = require('body-parser'); 

// connect mongodD with Mongoose
main().catch(err => console.log(err));
async function main(){
        await mongoose.connect("mongodb://127.0.0.1:27017/User");
}
// Define Schema 
const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

// Encryption plug in 
userSchema.plugin(encrypt, {secret : "MyNameIsBondithAndIloveVichet", encryptedFields : ['password']}); 

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
        password : req.body.password
    });
    newUser.save();
    res.render("secrets");
}); 

app.post("/login", async function(req, res){
    const email = req.body.username; 
    const password = req.body.password; 

    const userInfo = await User.findOne({email : email, password : password});
    if (userInfo != null)
        res.render("secrets");
    else 
        res.render("login"); // Password Incorrect;
});

app.listen(3000, function(){
    console.log("Server started on port 3000!");
});