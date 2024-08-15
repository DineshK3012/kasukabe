import {Request, Response} from "express";
import User from "../models/user";

const registerUser = async (req: Request, res: Response)=> {
    try{
        const {username, name, email, password} = req.body;

        if(!username || !name || !email || !password){
            return res.status(400).json({
                success:false,
                message: "All fields are required"
            })
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already existed"
            })
        }

        const user = await User.create({
            username,
            name,
            password,
            email
        })

        const token = await user.generateToken();

        res.status(201).cookie("token", token, {
            expires: new Date(Date.now() + 10* 24*60*60*1000),
            httpOnly: true,
            secure: true,
            sameSite: 'lax'//more lenient sameSite setting
        })
            .json({
                success: true,
                user,
                message: "Registration Successful"
            })

    }catch (error: unknown) {
        const err = error as Error; // Type assertion
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

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