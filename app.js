//jshint esversion:8
//L-2 : Encryption
require('dotenv').config();
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

//L-6 OAuth using Google OAuth2.0
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const FacebookStrategy = require('passport-facebook').Strategy;
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

//GoogleId is added to Schema.
const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    googleId: String,
    secret : [String]
});

//Plugin Passport Local Mongoose
userSchema.plugin(passportLocalMongoose);

//Plugin FOr findorCreate Method
userSchema.plugin(findOrCreate);


const User = new mongoose.model('user',userSchema);

//Same implementation for any strategy-i.e local or Oauth
//Use the Strategy on the user i.e email and password 
passport.use(User.createStrategy());

//Serialize -creates the the cookie
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

//and deserialize - Deletes the cookie
passport.deserializeUser(function(id, done) {
User.findById(id, function(err, user) {
    done(err, user);
  });
});
  



//Implementing the google OAuth2.0 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
      //This is a Facebook ID method rather than mongoose method
      //To find the user in our DB or create the user and store in userDb
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));




passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

app.listen(port , function(request,response)
{
       console.log("Server has been started at " + port);
});

app.get("/",function(request,myServerResponse)
{
    if(request.isAuthenticated())
    myServerResponse.redirect("/secrets");
    else 
     myServerResponse.render("home");

});

app.get("/login",function(request,myServerResponse)
{
     myServerResponse.render("login");
     
});
//Routing to google Auth and tapping passport google strategy callback 
//Authorizing or providing required redentials such as profile.id,email
//passport.authenticate acts as a middleware of express route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

//Authenticating the user 
app.get('/auth/google/secrets', 
passport.authenticate('google', { failureRedirect: '/login' }),
function(request, myServerResponse) {
  // Successful authentication, redirect secrets.
  myServerResponse.redirect('/secrets');
});  

app.get('/auth/facebook',
  passport.authenticate('facebook'));

  app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(request, myServerResponse) {
    // Successful authentication, redirect home.
    myServerResponse.redirect('/secrets');
  });

 
app.get("/register",function(request,myServerResponse)
{
     myServerResponse.render("register");
     
});

app.get("/secrets",function(request,myServerResponse){
    User.find({secret : {$ne : null}},function(err,foundUsers){
              if(err)
              console.log(err);
              else 
              {
                  if(foundUsers){
                      myServerResponse.render("secrets",{secretsArray : foundUsers});
                  }
              }
    });

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


app.get("/submit",function(request,myServerResponse){
    if(request.isAuthenticated())
    myServerResponse.render("submit");
    else 
    myServerResponse.redirect("/login");
});

app.post("/submit",function(request,myServerResponse){
      const submittedSecret = request.body.secret;
      const userprofile = request.user.id;

    User.findByIdAndUpdate(userprofile,{$push : {secret : submittedSecret}},function(err,foundUser){
               if(err)
               console.log(err);
               else if(foundUser){
                   console.log("Updated Succesfully");
                   myServerResponse.redirect("/secrets");
               }
    });
});

app.get("/logout",function(request,myServerResponse){
    //Log-out off the session 
      request.logout();
      myServerResponse.redirect("/");
});
