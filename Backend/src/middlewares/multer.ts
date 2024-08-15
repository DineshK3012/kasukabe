import {Request} from "express";
import multer, {FileFilterCallback} from "multer";
import path from "node:path"

const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits: {fileSize: 5e6 }, // 5mb or 5 * 1024 * 1024
    fileFilter: (req: Request, file: Express.Multer.File, cb : FileFilterCallback) => {
        if(file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
            cb(null, true);
        }else{
            cb(new Error("Only jpg or png are allowed") as unknown as null, false);
        }
    }
})

export default upload;
