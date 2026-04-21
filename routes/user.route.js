


import express from 'express';
import { forgotPassword,resetPassword,
    singUp,login ,protect,restricTo
} from './../controllers/auth.controller.js'
import multer from 'multer';
import {updateMe, updateUser , deleteMe ,getAllUsers,getUser,getMe,uploadUserPhoto} from '../controllers/user.controller.js';

const upload=multer({
    dest:'public/img/users'
});

const userRouter=express.Router();
// auth
userRouter.route('/signup').post(singUp)
userRouter.route('/login').post(login)
userRouter.post("/forgotPassword", forgotPassword);
userRouter.patch("/resetPassword/:token", resetPassword);

//✨ middleware to protect the routes after this middleware
userRouter.use(protect); 

// user
userRouter.patch("/deleteMe", deleteMe); // we will not actually delete the user from the database but we will set the active field to false and then we will filter out the inactive users in the find query in the user model

userRouter.route('/me').get(getMe,getUser);

userRouter.patch("/updateMe", protect, uploadUserPhoto, updateMe); // to update the user data and also to upload the user photo

//only admin
userRouter.use(restricTo('admin')); // ✨to restrict the routes after this middleware to only admin

userRouter.patch("/updateUser", updateUser);

userRouter.route('/').get(getAllUsers)

userRouter.route('/:id').get(getUser);

export default userRouter;