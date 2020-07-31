//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('cookie-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://Pratik:Pratik290ververvtbtbt2@cluster0-hgfgs.mongodb.net/usefvwetvtberDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    index: true,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(v);
      },
      message: props => `${props.value} is not a valid Password`
    }
  },
  tel: {
    type: String,
    index: true,
    unique: true,
    sparse: true
  },
  city:String,
  address: String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



app.get("/", function(req, res){
  res.render("index");
});

app.get("/index", function(req, res){
  res.render("index");
});

app.get("/Login", function(req, res){
  res.render("Login");
});

app.get("/Signup", function(req, res){
  res.render("Signup");
});

app.get("/product", function(req, res){
  res.render("product");
});

app.get("/setting", function(req, res){
  res.render("setting");
});

app.get("/sucess", function(req, res){
  res.render("sucess");
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/cart", function(req, res){
  if (req.isAuthenticated()){
    res.render("cart");
  } else {
    res.redirect("/Login");
  }
});



// app.post("/submit", function(req, res){
//   const submittedSecret = req.body.secret;
//
// //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
//   // console.log(req.user.id);
//
//   User.findById(req.user.id, function(err, foundUser){
//     if (err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//         foundUser.secret = submittedSecret;
//         foundUser.save(function(){
//           res.redirect("/secrets");
//         });
//       }
//     }
//   });
// });



app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started");
});
