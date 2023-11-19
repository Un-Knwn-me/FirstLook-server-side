const mongoose = require('mongoose');
const validator = require('validator');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:(value)=>validator.isEmail(value)
    },
    phone:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    password:{
        type:String,
        required:true,
    },
    shirtSize:{
        type:Number,
        required:true,
    },
    hipSize:{
        type:Number,
        required:true,
    },
    height:{
        type:Number,
        required:true,
    },
    weight:{
        type:Number,
        required:true,
    },
},{versionKey: false, collection:"user"});

const UserModel = mongoose.model('user', userSchema)
module.exports = { UserModel };