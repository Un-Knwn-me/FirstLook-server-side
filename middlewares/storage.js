const path = require('path');
const { Storage } = require('@google-cloud/storage');
const multerGoogleStorage = require('multer-google-storage');
const multer = require('multer');
require('dotenv').config();

let gcredentials;
try {
  gcredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
} catch (error) {
  console.error('Error parsing Google Cloud credentials JSON:', error);
  process.exit(1);
}

const storage = new Storage({
  // keyFilename: path.join(__dirname, '../mad-monkeyz-c2e97e57f277.json'),
  credentials: gcredentials,
  projectId: process.env.ProjectId,
});

const bucketName = 'firstlook-ecommerce';

const multerStorage = multerGoogleStorage.storageEngine({
  autoRetry: true,
  bucket: 'firstlook-ecommerce',
  projectId: 'mad-monkeyz',
  credentials: gcredentials,
  // keyFilename: path.join(__dirname, '../mad-monkeyz-c2e97e57f277.json'),
  filename: (req, file, cb) => {
    cb(null, file.originalname);    
    // cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: multerStorage });

module.exports = {upload, storage, bucketName};