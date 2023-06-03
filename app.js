//jshint esversion:6
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); 
const ejs = require('ejs'); 
const bodyParser = require('body-parser'); 
const md5 = require('md5');
const session = require('express-session'); 
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

/*
    1. Set up express session
    2. Initialize passport and use it
*/

// Initialize App with Express
const app = new express(); 

// Deploy ejs
app.set("view engine", "ejs");
// Deploy Body-parser 
app.use(bodyParser.urlencoded({extended : true})); 
// Express
app.use(express.static("public"));
// Express session : Don't foget to read through the docs
app.use(session({
    secret : "My Litter Secret!",
    resave : false, 
    saveUninitialized : false
}));
// Initialize passport
app.use(passport.initialize());

// Tell app to use passport to deal with session : read docs on configure section
app.use(passport.session()); 

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

// Set up passport-local-mongoose
userSchema.plugin(passportLocalMongoose); // do all the salt and hash

// Initialize collection
const User = new mongoose.model('User', userSchema);

// passport config with mongodb 
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
}); 

app.get("/register", function(req, res){
    res.render("register");
}); 

app.get("/secrets", function(req, res){
    if(req.isAuthenticated())
        res.render("secrets");
    else
        res.redirect("/login");
});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err)
            console.log(err);
        else
            res.redirect("/");
    });
});

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    }); 
}); 

app.post("/login", async function(req, res){
    const user = new User({
        username : req.body.username, 
        password : req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
   });
});

app.listen(3000, function(){
    console.log("Server started on port 3000!");
});