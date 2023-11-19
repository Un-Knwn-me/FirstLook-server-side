const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");   

require('dotenv').config();


const hashPassword = async(password)=>{
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);
  return hash;
}

const hashCompare = (password, hash) =>{
  return bcrypt.compare(password,hash);
}

const createToken = ({firstName, lastName, email, role, image})=>{
  let token = jwt.sign({firstName, lastName, email, role, image}, process.env.SecretKey, {expiresIn: "60m"});
//   var token = jwt.sign({email_id:'123@gmail.com'}, "Stack", {});
  return token;
}

const decodeToken = (token) => {
  let data = jwt.verify(token, process.env.SecretKey);
  return data;
};

module.exports = {hashCompare, hashPassword, createToken, decodeToken,}