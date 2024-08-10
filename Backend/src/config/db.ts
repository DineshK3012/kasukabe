import mongoose from "mongoose"

const connectDatabase = () =>{
    mongoose.connect(process.env.MONGO_URI as string)
        .then((con)=>{
            console.log(`MongoDB database connected with HOST: ${con.connection.host}`);
        })
        .catch((err: Error)=>{
            console.log(`MongoDB database connection error: ${err}`);
        })
}

export default connectDatabase;