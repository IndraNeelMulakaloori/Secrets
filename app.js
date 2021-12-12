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