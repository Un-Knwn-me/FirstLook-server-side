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

const createToken = ({_id, name, email, role})=>{
  let token = jwt.sign({_id, name, email, role}, process.env.SecretKey);
//   var token = jwt.sign({email_id:'123@gmail.com'}, "Stack", {});
  return token;
}

const decodeToken = (token) => {
  let data = jwt.verify(token, process.env.SecretKey);
  return data;
};

module.exports = {hashCompare, hashPassword, createToken, decodeToken,}