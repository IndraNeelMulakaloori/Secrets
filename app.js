//jshint esversion:6
//L-2 : Encryption
// require('dotenv').config();
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
// //L-3 Hashing
// const sha512 = require('js-sha512');
// //L-4 hashing + Salting
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

//L-5 Session
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine','ejs');

//Creating a Session by passing a secret,without resaving and saveUnintialized is false
app.use(session({
 secret : "MyLittlesecret",
 resave : false,
 saveUninitialized:false
}));

//Intialize the passport session
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userdb');

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

//Plugin Passport Local Mongoose
userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model('user',userSchema);

//Use the Strategy on the user i.e email and password 
passport.use(User.createStrategy());
//Serialize -creates the the cookie
passport.serializeUser(User.serializeUser());
//and deserialize - Deletes the cookie
passport.deserializeUser(User.deserializeUser());


app.listen(port , function(request,response)
{
       console.log("Server has been started at " + port);
});

app.get("/",function(request,myServerResponse)
{
     myServerResponse.render("home");

});

app.get("/login",function(request,myServerResponse)
{
     myServerResponse.render("login");
     
});

app.get("/register",function(request,myServerResponse)
{
     myServerResponse.render("register");
     
});

app.get("/secrets",function(request,myServerResponse){
    //Here the user is authenticated i.e user is logged in to the session the secrets page is rendered
   if(request.isAuthenticated())
   myServerResponse.render("secrets");
   else 
   //Else the user is redirected to login page
   myServerResponse.redirect("/login");

});





app.post("/register",function(request,myServerResponse){
//Registering the username nad password and authenticating using local strategy by passport-local-mongoose
    User.register({username: request.body.username},request.body.password,function(err,user){
               if(err)
               {
                   //If any error occurs,user is redirected to register route
               console.log(err);
               myServerResponse.redirect("register");
               }
               else{
                   //else the user is authenticated and redirected to /secrets route
                passport.authenticate("local")(request,myServerResponse,function(){
                       myServerResponse.redirect("/secrets");
                });
               }
    });
   

   

   

});

app.post("/login",function(request,myServerResponse){
    
    const user = new User({
         username : request.body.username,
         password : request.body.password
    });
    //Requests a login and authenticates it when the user is found
    request.login(user,function(err){
          if(err)
          console.log(err);
          else{
                passport.authenticate('local')(request,myServerResponse,function(){
                     myServerResponse.redirect("/secrets");
                });
          }
    });
   
      
});


app.get("/logout",function(request,myServerResponse){
    //Log-out off the session 
      request.logout();
      myServerResponse.redirect("/");
});
