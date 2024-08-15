import {Request, Response} from "express";
import User from "../models/user";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs from "node:fs";

type CloudinaryUploadResponse = {
    public_id: string;
    secure_url: string;
    [key: string]: any; // To account for any additional fields that Cloudinary might return
};

const registerUser = async (req: Request, res: Response) => {
    let profileImageUploadResult: CloudinaryUploadResponse | null = null;
    let idUploadResult: CloudinaryUploadResponse | null = null;

    try {
        const { username, name, email, password } = req.body;

        if (!username || !name || !email || !password) {
            // If fields are missing, delete any uploaded files
            deleteTemporaryFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if (existingUser) {
            // If user exists, delete any uploaded files
            deleteTemporaryFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Upload profile image if provided
        if (files?.profile_img?.[0]) {
            const profileImageMimeType = files.profile_img[0].mimetype.split('/').at(-1);
            const fileName = files.profile_img[0].filename;
            const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName);

            profileImageUploadResult = await cloudinary.uploader.upload(filePath, {
                filename_override: fileName,
                folder: 'Placement_Insights/profiles',
                format: profileImageMimeType,
            });

            // Delete temporary profile image file
            await fs.promises.unlink(filePath);
        }

        // Upload college ID if provided
        if (files?.college_id?.[0]) {
            const idFileName = files.college_id[0].filename;
            const idFilePath = path.resolve(__dirname, "../../public/data/uploads", idFileName);
            const idFileMimeType = files.college_id[0].mimetype.split('/').at(-1);

            idUploadResult = await cloudinary.uploader.upload(idFilePath, {
                filename_override: idFileName,
                folder: 'Placement_Insights/ids',
                format: idFileMimeType
            });

            // Delete temporary college ID file
            await fs.promises.unlink(idFilePath);
        }

        const user = await User.create({
            username,
            name,
            password,
            email,
            profile_img: profileImageUploadResult?.secure_url,
            college_id: idUploadResult?.secure_url
        });

        const token = await user.generateToken();

        res.status(201).cookie("token", token, {
            expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        }).json({
            success: true,
            user,
            token,
            message: "Registration Successful"
        });

    } catch (error: unknown) {
        const err = error as Error;

        // Rollback: Delete files from Cloudinary if upload was successful but registration failed
        if (profileImageUploadResult) {
            await cloudinary.uploader.destroy(profileImageUploadResult.public_id);
        }
        if (idUploadResult) {
            await cloudinary.uploader.destroy(idUploadResult.public_id);
        }

        res.status(500).json({
            success: false,
            message: err.message,
        });

    } finally {
        // Ensure temporary files are deleted even if an error occurs
        deleteTemporaryFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
    }
};

// Helper function to delete temporary files
const deleteTemporaryFiles = (files: { [fieldname: string]: Express.Multer.File[] }) => {
    if (files?.profile_img?.[0]) {
        const filePath = path.resolve(__dirname, "../../public/data/uploads", files.profile_img[0].filename);
        fs.promises.unlink(filePath).catch(() => { /* ignore error */ });
    }
    if (files?.college_id?.[0]) {
        const filePath = path.resolve(__dirname, "../../public/data/uploads", files.college_id[0].filename);
        fs.promises.unlink(filePath).catch(() => { /* ignore error */ });
    }
};
const loginUser = async (req:Request,res:Response)=>{
    try{
        const { username, password } = req.body;

        if(!username || !password){
            return res.status(400).json({
                success: false,
                message: "All fields required"
            })
        }

        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({
                success: false,
                message: "No user found with this email"
            })
        }

        const isMatch = await user.matchPassword(password as string);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            })
        }

        const token = await user.generateToken();

        res.status(200).
        cookie("token", token, {
            expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: 'lax' // Allow cross-site requests
        })
            .json({
                success: true,
                user,
                token,
                message: "Login successful"
            })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false
        })
    }
}

export {registerUser, loginUser};