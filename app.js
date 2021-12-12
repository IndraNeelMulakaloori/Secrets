//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/userdb');

const userSchema = {
    email : String,
    password : String
};

const User = new mongoose.model('user',userSchema);

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

app.post("/register",function(request,myServerResponse){
    const userName = request.body.username;
    const userPass = request.body.password;
    console.log(userName);
    console.log(userPass);

    const newUsr = new User({
        email : userName,
        password : userPass
    });

    newUsr.save(function(err){
      if(err)
      console.log(err);
      else
      myServerResponse.render("secrets");
    });

});

app.post("/login",function(request,myServerResponse){
    const userName = request.body.username;
    const userPass = request.body.password;


    console.log(userName);
    console.log(userPass);
    
    User.findOne({email : userName},function(err,result){
           if(err)
           console.log(err);
           if(result.password == userPass)
           myServerResponse.render("secrets");
           else
           myServerResponse.send("OOPs wrong password");

    });

    
});