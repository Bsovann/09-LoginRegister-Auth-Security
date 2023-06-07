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
const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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
    password : String,
    googleId : String,
    facebookId : String
});

// Set up passport-local-mongoose
userSchema.plugin(passportLocalMongoose); // do all the salt and hash
// Plugin findOrCreate
userSchema.plugin(findOrCreate);

// Initialize collection
const User = new mongoose.model('User', userSchema);

// passport config with mongodb 
passport.use(User.createStrategy());

// Passport serialize user
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });

// Passport deserialize user
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

// Begin Google Login
// Google Strategy
passport.use(new GoogleStrategy({

    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, 
function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
    });
  }
));

app.get("/auth/google", passport.authenticate("google", { scope : ["profile"] }));

app.get("/auth/google/secrets", passport.authenticate("google", { failureRedirect : "/login" }), function(req, res){
    res.redirect("/secrets");
});
// End Google Login

// Begin facebook Login
// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
    profileFields: ["id", "displayName", "photos", "email"]
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/auth/facebook", passport.authenticate("facebook", { scope : ["email"] }));
app.get("/auth/facebook/secrets", passport.authenticate("facebook", { failureRedirect : "/login" }), 
    function(req, res){
    res.redirect("/secrets");
});
// End facebook Login

// Render Home Page
app.get("/", function(req, res){
    res.render("home");
});

// Render Login Page
app.get("/login", function(req, res){
    res.render("login");
}); 

// Render Register Page
app.get("/register", function(req, res){
    res.render("register");
}); 

// Render Secret Page
app.get("/secrets", function(req, res){
    if(req.isAuthenticated())
        res.render("secrets");
    else
        res.redirect("/login");
});

// Render Logout Page
app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err)
            console.log(err);
        else
            res.redirect("/");
    });
});

// Post request for Register Page
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

// Post request for Login Page
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

// Start Up Server
app.listen(3000, function(){
    console.log("Server started on port 3000!");
});