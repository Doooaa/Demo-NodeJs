import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import catchAysncFunction from "../utils/catchAysnc.js";
import appError from "../utils/AppError.js";
import { CreateOne, FindAll, FindOneById } from "../utils/handlerFactory.js";
import multer from "multer";


const multerStorge = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    }
    , filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); // to save the photo with a unique name using the user id and the current timestamp to avoid overwriting existing photos
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else 
    {
        cb(new appError('Not an image! Please upload only images.', 400), false);
    }
}

const upload=multer({
    storage: multerStorge,      
    fileFilter: multerFilter
})

//mideleware to handle the photo upload and save the photo name in the database
export const uploadUserPhoto = upload.single('photo');

// export const resizeUserPhoto=(req,res,next)=>{
//     if(!req.file) return next();
//   sharp(  req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/users/user-${req.user.id}-${Date.now()}.jpeg`)

// }

const filteredBodyFunc = (body, ...allowedFields) => {
    const newObj = {};
    Object.keys(body).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = body[el];
    });
    return newObj;
};


//update user by id => only for admin
export const updateUser = catchAysncFunction(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.confirmPassword) {
        return next(new appError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }
    // 2) Update user document 
    const filteredBody = filteredBodyFunc(req.body, 'name', 'email', 'role');

    const updatedUser = await userModel.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, //return updated user data not old one
        runValidators: true // to run the validators defined in the schema for the updated fields
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})


export const deleteMe = catchAysncFunction(async (req, res, next) => {
    await userModel.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: {
            message: "user deleted successfully"
        }
    });
})

export const getMe = catchAysncFunction(async (req, res, next) => {
    req.params.id = req.user.id;
    next();
});

export const updateMe = catchAysncFunction(async (req, res, next) => {
    console.log('updateMe function called', req.body);
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.confirmPassword) {
        return next(new appError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }
    // 2) Update user document
    const filteredBody = filteredBodyFunc(req.body, 'name', 'email');
    //SAVE PHOTO NAME IN THE DATABAS IF THE USER UPLOAD A PHOTO
    if (req.file) filteredBody.photo = req.file.filename; // to save the photo name in the database
    const updatedUser = await userModel.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, //return updated user data not old one
        runValidators: true // to run the validators defined in the schema for the updated fields
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

export const getAllUsers = FindAll(userModel);

export const getUser = FindOneById(userModel);
