const path = require('path');
const { Storage } = require('@google-cloud/storage');
const multerGoogleStorage = require('multer-google-storage');
const multer = require('multer');
require('dotenv').config();

const storage = new Storage({
  // keyFilename: path.join(__dirname, '../mad-monkeyz-c2e97e57f277.json'),
  credentials: JSON.parse(process.env.GOOGLE_STORAGE_CREDENTIALS),
  projectId: process.env.ProjectId,
});

const bucketName = 'firstlook-ecommerce';

const multerStorage = multerGoogleStorage.storageEngine({
  autoRetry: true,
  bucket: 'firstlook-ecommerce',
  projectId: 'mad-monkeyz',
  credentials: JSON.parse(process.env.GOOGLE_STORAGE_CREDENTIALS),
  // keyFilename: path.join(__dirname, '../mad-monkeyz-c2e97e57f277.json'),
  filename: (req, file, cb) => {
    cb(null, file.originalname);    
    // cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: multerStorage });

module.exports = {upload, storage, bucketName};