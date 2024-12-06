const express = require('express');
const multer = require('multer');
const router = express();

const uploadimageOnS3Controller = require('../controllers/uploadimageOnS3Controller');

const storageS3 = multer.memoryStorage();
const upload = multer({storage:storageS3})
router.post('/uploadToS3', upload.single('profilePic'), uploadimageOnS3Controller.uploadToS3)
router.post('/viewToS3', uploadimageOnS3Controller.viewToS3);
router.post('/deleteToS3', uploadimageOnS3Controller.deleteToS3);

module.exports = router;