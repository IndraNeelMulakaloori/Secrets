//jshint esversion:6
//L-2 : Encryption
require('dotenv').config();
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
//L-3 Hashing
const sha512 = require('js-sha512');
//L-4 hashing + Salting
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
// userSchema.plugin(encrypt,{secret : process.env.SECRET, encryptedFields: ["password"]});


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
   //Passing the password into the hash function and salting.
   //Storing the shash in DB
    bcrypt.hash(request.body.password,saltRounds,function(err,hash){
        const newUsr = new User({
            email : request.body.username,
            password : hash
        });
        newUsr.save(function(err){
            if(err)
            console.log(err);
            else
            myServerResponse.render("secrets");
          });
    });
   

   

   

});

app.post("/login",function(request,myServerResponse){
    const userName = request.body.username;
    const userPass = request.body.password;

    console.log(userPass);
   

    User.findOne({email : userName},function(err,foundUser){
           if(err)
           console.log(err);
           //Compare the passwords stored in DB using bcrypt.compare
         if(foundUser)
         {
                 bcrypt.compare(userPass,foundUser.password,function(err,result){
                            if(result)
                            myServerResponse.render("secrets");
                            else 
                            console.log(err);
                 });
         }
           else
           myServerResponse.send("OOPs wrong password");

    });

      
});

