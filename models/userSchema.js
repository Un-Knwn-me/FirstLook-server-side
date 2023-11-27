const mongoose = require('mongoose');
const validator = require('validator');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name:{
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
        minMax: 10,
        required:true,
        unique:true,
        index:true,
    },
    password:{
        type:String,
        required:true,
    },
    shirtSize:{
        type:String,
        required:true,
    },
    hipSize:{
        type:String,
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
    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products'
            },
            quantity: {
                type: Number
            }
        }
    ],
},{versionKey: false, collection:"user"});

const UserModel = mongoose.model('user', userSchema)
module.exports = { UserModel };