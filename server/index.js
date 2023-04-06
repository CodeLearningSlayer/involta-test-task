import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});
const app = express();
const PORT = 3010;
const mimetypeRegEx = /image\/jpeg$|png$|jpg$/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, 'uploads');

const fileFilter = (req, file, cb) => {
    if (!mimetypeRegEx.test(file.mimetype)) // не скачивать фото
        cb(null, false);
    else
        cb(null, true); //скачать
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});


app.use(cors());

app.get("/uploads", (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send("server error")
        }
        res.json(files);
    })
})

app.get("/uploads/:filename", (req, res) => {
    try{
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath))
            res.sendFile(filePath)
        else
            res.send(404).send("file not found");
    } catch(e){
        console.log(e);
    }
});

app.post("/uploadFile", upload.single("selectedImage"), (req, res, next) => { // middleware
    try{
        res.json({
            success: 1,
            file: {
                url: `http://localhost:3010/uploads/${req.file.originalname}`
            }
        })
        next();
    }
    catch(e) {
        res.json({message: "Ошибка при отправке"});
    }
})


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})