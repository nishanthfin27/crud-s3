require('dotenv').config()
const express = require('express')
const app = express()
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

app.listen(3001)

aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION
})

const bucket = process.env.BUCKET
const s3 = new aws.S3()

const upload = multer({
    storage: multerS3({
        bucket: process.env.BUCKET,
        s3: s3,
        acl: "public-read",
        key: (req, file, cb) => {
            cb(null, file.originalname)
        }
    })
})

app.get("/list", async (req, res) => {
    let r = await s3.listObjectsV2({ Bucket: process.env.BUCKET }).promise()
    let x = r.Contents.map(item => JSON.stringify(item.key))
    res.send(x)
})


app.post("/upload", upload.single("file"), (req, res) => {
    console.log(req.file)

    res.send('successfully uploaded' + req.file.location + 'location')
})

app.get("/download/:filename", (req, res) => {
    const filename = req.params.filename
    s3.getObject({ Bucket: process.env.BUCKET, key: filename }).promise()
    res.send(x.Body);
})

app.delete("/delete/:filename", async (req, res) => {
    const filename = req.params.filename
    await s3.deleteObject({ Bucket: process.env.BUCKET, key: filename }).promise()
    res.send("File Deleted Successfully")
})