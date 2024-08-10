import mongoose from "mongoose";
import {User} from "../Types/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema= new mongoose.Schema<User>({
    username: {
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    profile_url:{
        type:String
    },
    college_id:{
        type:String
    },
    password:{
        type:String,
        required:true
    },
    verified: {
        type: Boolean,
        default: false
    }
},{timestamps: true})

//pre-save middleware
userSchema.pre("save", async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
})

//method to compare password
userSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

//method to generate jwt token
userSchema.methods.generateToken = async function ():Promise<String> {
    return await jwt.sign({ _id: this._id as string }, process.env.JWT_SECRET as string);
}

export default mongoose.model<User>("User", userSchema);