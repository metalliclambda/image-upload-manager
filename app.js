const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const multer  = require('multer');
const crypto = require("crypto");
var path = require('path');
const sharp = require('sharp');
const fs = require('fs');


// creating directories
let dirs = [path.join('public' , 'thumbnails') , path.join('user-files' , 'uploads')];
dirs.forEach( (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir ,{recursive: true})
    }
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {  
        // Uploads is the Upload_folder_name
        cb(null, path.join('user-files' , 'uploads'))
    },
    filename: function (req, file, cb) {
      cb(null,  fileNameHash() + path.extname(file.originalname))
    }
})

var upload = multer({ 
    storage: storage,
    
// imageToUpload is the name of file attribute
}).single("imageToUpload");     

const app = express();
app.use(express.static(__dirname + '/public'));
app.use('/images',express.static(__dirname + '/user-files'));

app.set('view engine', 'ejs');

// you should use your own MongoDB database
mongoose.connect('mongodb://localhost:27017/zzFileUploadTest', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("DB Connected");
});

const fileListSchema = new mongoose.Schema({
    fileName : String ,
    fileSize : Number ,
    uploadTime : Date ,
    madeTime : Date ,
    pictureWidth : Number,
    pictureHeight : Number,
    fileAddress : String
});

const File = mongoose.model('File', fileListSchema);

app.get('/' , (req,res) => {
    res.render('index');
});

app.get('/list' , (req,res)=>{

    File.find(function (err, results) {
        if (err) return console.error(err);
        res.render('list' , {files : results});
    });


});

app.get('/images/:fileName' , (req,res)=>{
    res.render('imgShow' , {fileName : req.params.fileName});    
});

app.post('/upload', function (req, res, next) {
    upload(req,res,function(err) {
  
        if(err) {  
            // ERROR occured (here it can be occured due 
            //to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {
            let newFile = new File({
                fileName : req.file.filename ,
                fileSize : req.file.size ,
                uploadTime : Date.now() ,
                madeTime : req.body.lastModified ,
                pictureWidth : req.body.imgNaturalWidth ,
                pictureHeight : req.body.imgNaturalHeight ,
                fileAddress : path.join(__dirname , req.file.path )
            });
            newFile.save(function(err){
                if(err){
                    console.log(err);
                } else {                    
                    sharp(path.join('user-files' , 'uploads' , req.file.filename))
                        .resize(200)
                        .toBuffer()
                        .then( data => {
                            fs.writeFileSync(path.join('public' , 'thumbnails' , req.file.filename), data);
                            res.redirect('/')
                        })
                        .catch( err => {
                            console.log(err);
                        });	
                }
            });
            
        }
    })    
});

app.post('/delete/:fileName' , (req,res)=>{
    let deletePath1 = path.join('user-files' , 'uploads' , req.params.fileName);
    let deletePath2 = path.join('public' , 'thumbnails' , req.params.fileName);
    File.findOneAndDelete({fileName: req.params.fileName }, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            fs.unlinkSync(deletePath1);
            fs.unlinkSync(deletePath2);
            res.redirect('/list');
        }
    });
});

app.listen(3000 , () => {
    console.log("Server runs at 3000");
});

function fileNameHash(){
    let hashedName = crypto.createHash("md5")
        .update(Date.now().toString())
        .digest("hex");
    return hashedName;
}
