


import express from 'express';
import { forgotPassword,resetPassword,
    singUp,login
} from './../controllers/auth.controller.js'

const userRouter=express.Router();

userRouter.route('/signup')
.post(singUp)

userRouter.route('/login')
.post(login)


userRouter.post("/forgotPassword", forgotPassword);
userRouter.patch("/resetPassword/:token", resetPassword);


export default userRouter;