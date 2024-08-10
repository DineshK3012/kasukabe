import {config} from "dotenv"
//configuring the env file only in development mode
// if (process.env.NODE_ENV !== 'PRODUCTION')
config()

import {Request, Response} from "express";

import express from "express"
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import userRouter from "./routes/user";
app.get("/", (req:Request, res:Response)=>{
    res.send("Working fine");
})
app.use('/api', userRouter);

export default app;