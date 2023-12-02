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
    },
    weight:{
        type:Number,
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
    orderId: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    },
],
    address: [
        {
            name: {
                type: String,
                required: true
            },
            phone: {
                type: Number,
                required: true
            },
            building: {
                type: String,
                required: true
            },
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            landmark: {
                type: String
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            },
            country: {
                type: String,
                default: 'India'
            },
        }
    ],
},{versionKey: false, collection:"user"});

const UserModel = mongoose.model('user', userSchema)
module.exports = { UserModel };