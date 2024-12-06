const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const AWS = require('aws-sdk');
//aws config
const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  });


const PORT = process.env.PORT || 5000;
dotenv.config();
app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use(cors());

app.use('/profile', express.static('public/images'));

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: './public/images',
    filename: function(req, file, cb) {
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        );
    }
});

// Initialize multer upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 } // Limiting file size to 5MB
});

app.post('/upload', upload.single('profile'),(req,res) => {
   res.json({
    success:true,
    profile_url:`http://localhost:5000/profile/${req.file.filename}`,
    data: req.body
   });
});


//upload image to S3

let uploadS3 = multer({
    limits: 1024 * 1024 * 5, // Limiting file size to 5MB
    fileFilter: function( req, file, done){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
            done(null, true)
        }else{
            done('file type not supportes', false)
        }           
    }
})

//upload single image on AWS S3
app.post('/upload-imageS3', uploadS3.single('image'), async (req,res) => {
    if(req.file){
        const file = req.file;        
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: crypto.randomBytes(4).toString('hex') + '-' + file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        try {
            const result = await S3.upload(params).promise();
            console.log(result);
            res.status(200).send({mgs:`File uploaded to S3 successfully!`, imageUrl:result.Location});
        } catch (error) {
            console.error(error);
            res.status(500).send('Error uploading file to S3');
        }
    }
})

//upload multiple image on AWS S3
app.post('/upload-multiple-imageS3', uploadS3.array('image',3), async (req,res) => {   
    try {
        if(req.files.length > 0){
            const files = req.files;
            for(let i = 0; i < files.length; i++){
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: crypto.randomBytes(4).toString('hex') + '-' + files[i].originalname,
                    Body: files[i].buffer,
                    ContentType: files[i].mimetype
                };
            
                const result = await S3.upload(params).promise();
                
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading file to S3');
    }            
    res.status(200).send({mgs:`File uploaded to S3 successfully!`});
});


const uploadImageOnS3 = require('./routes/uploadImageOnS3Route');
app.use('/S3', uploadImageOnS3);

app.listen(PORT, () => {
    console.log("Server Started: ", PORT)
})