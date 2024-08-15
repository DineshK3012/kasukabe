import {config} from "dotenv"
config()

import {Request, Response} from "express";

import express from "express"
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//cors integration here

import userRouter from "./routes/user";
app.get("/", (req:Request, res:Response)=>{
    res.send("Working fine");
})

app.use('/api/users', userRouter);

export default app;