const mongoose = require('mongoose');
const validator = require('validator');
require('dotenv').config();

const adminSchema = new mongoose.Schema({
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
    role:{
        type: String,
        default: 'Admin',
    },
},{versionKey: false, collection:"admin"});

const AdminModel = mongoose.model('admin', adminSchema)
module.exports = { AdminModel };