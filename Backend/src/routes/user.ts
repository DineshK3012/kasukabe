import {Router} from "express";
import {loginUser, registerUser} from "../controllers/user"
import upload from "../middlewares/multer"

const userRouter = Router();
userRouter.route('/register').post(upload.fields([
    {name: "profile_url", maxCount: 1},
    {name: "college_id", maxCount: 1}
]), registerUser);
userRouter.route('/login').post(loginUser);

export default userRouter;