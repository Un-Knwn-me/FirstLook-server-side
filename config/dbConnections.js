var mongoose = require('mongoose');
const mongodb = require('mongodb');
const dbName = 'madMonkeyz';
require('dotenv').config();
const db_url = `${process.env.DB_URL}/${dbName}`;
const MongoClient = mongodb.MongoClient;
module.exports = { mongodb, dbName, db_url, MongoClient };

// db connection
const dbConnect = async() => {
   await mongoose.connect(db_url)
  console.log("Connected")
}

module.exports = dbConnect;