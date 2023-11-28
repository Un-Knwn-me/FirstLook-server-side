const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");   
const { decodeToken } = require("../controllers/auth");

require('dotenv').config();

const isSignedIn = async (req, res, next) => {
    try {
      if (req.headers.authorization) {
      let token = req.headers.authorization.split(' ')[1];
      let data = decodeToken(token);
      req.user = {_id: data._id};
      next();       
     } else {
     return res.status(400).json({ message: "Access denied" });
}
    }
     catch (error) {
      return res.status(500).json({ message: "Invalid Authentication", error });
    }
};


const roleAdmin = async(req,res, next)=>{
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let data = decodeToken(token);
            if(data.role === "Admin"){
              next();
            } else {
              return res.status(401).json({ message: "Admin only" });  
            } 
          }
    } catch (error) {
        return res.status(500).json({ message: "Invalid Authentication" }); 
    }
}


module.exports = {isSignedIn, roleAdmin}