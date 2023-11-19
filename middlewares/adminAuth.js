const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");   
const { decodeToken } = require("../controllers/auth");

require('dotenv').config();

const isSignedIn = async (req, res, next) => {
    try {
      if (req.headers.authorization) {
      let token = req.headers.authorization.split(' ')[1];
      let data = decodeToken(token);
      req.user = { firstName: data.firstName, lastName: data.lastName };
      if((Math.floor(Date.now()/1000))<= data.exp){
        next();
      } else {
        return res.status(401).json({ message: "Login Expired" });  
      } 
     } else {
     return res.status(400).json({ message: "Access denied" });
}
    }
     catch (error) {
      return res.status(500).json({ message: "Invalid Authentication" });
    }
};


const roleManager = async(req,res, next)=>{
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let data = decodeToken(token);
            if(data.role === "Manager"){
              next();
            } else {
              return res.status(401).json({ message: "Manager only" });  
            } 
          }
    } catch (error) {
        return res.status(500).json({ message: "Invalid Authentication" }); 
    }
}

const adminManager = async(req, res, next)=>{
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let data = decodeToken(token);
            if((data.role === "Manager") || (data.role === "Admin")){
              next();
            } else {
              return res.status(401).json({ message: "Manager only" });  
            } 
          }        
    } catch (error) {
        return res.status(500).json({ message: "Invalid Authentication" });
    }
}

const authorizedUsers = async(req, res, next) => {
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let data = decodeToken(token);
            if(data.role != "User"){
              next();
            } else {
              return res.status(401).json({ message: "Authorized User only" });  
            } 
          }
    } catch (error) {
        return res.status(500).json({ message: "Invalid Authentication" });
    }
}

module.exports = {isSignedIn, roleManager, adminManager, authorizedUsers,}