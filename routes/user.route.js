


import express from 'express';
import {
    singUp,login
} from './../controllers/auth.controller.js'

const userRouter=express.Router();

userRouter.route('/signup')
.post(singUp)

userRouter.route('/login')
.post(login)


export default userRouter;