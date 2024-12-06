const {S3RequestPresigner, getSignedUrl} = require('@aws-sdk/s3-request-presigner');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const sharp = require('sharp');
const path = require('path');

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    }
});   

const uploadToS3  = async (req,res) => {    
    
    //const  fileName = Date.now() +'_'+ req.file.originalname;
    const  fileName = req.file.fieldname + '-' + Date.now() + path.extname(req.file.originalname);
    const  buffer = await sharp(req.file.buffer).resize({height: 1920,width:1080, fit:"contain"}).toBuffer();
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer
    });            
    const data = await client.send(command);   
    res.status(200).json({image:fileName});

}
const viewToS3 = async (req,res) => {
    const fileName = req.body.fileName;
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName
    }
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(client, command, {expiresIn: 60});
    res.status(200).json({url});
}

const deleteToS3 = async (req, res) => {   
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.body.fileName
    }
    const command = new DeleteObjectCommand(params);
    const data = await client.send(command);
    res.status(200).json({url});
}


module.exports = {
    uploadToS3,
    viewToS3,
    deleteToS3,
}