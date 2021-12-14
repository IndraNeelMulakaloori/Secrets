//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/userdb');

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});



//Using a secret random string to encrypt the password of userDB using AES-256-CBC encryption.
//.For more info : https://www.npmjs.com/package/mongoose-encryption
//plugins the encrypt function by using the secret string.
//encryptedFields option is used to encrypt certain fields only.
//Save-encrypt find-decrypt
userSchema.plugin(encrypt,{secret : process.env.SECRET, encryptedFields: ["password"]});


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


   

    User.findOne({email : userName},function(err,result){
           if(err)
           console.log(err);
           if(result.password == userPass)
           myServerResponse.render("secrets");
           else
           myServerResponse.send("OOPs wrong password");

    });

      
});