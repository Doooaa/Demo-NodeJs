import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import catchAysncFunction from "../utils/catchAysnc.js";
import appError from "../utils/AppError.js";
import env from "dotenv";
env.config();
// SIGNUP
export const singUp = catchAysncFunction(async (req, res, next) => {
    const newUser = await userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });
    if (!process.env.JWT_SECRET) {
        return next(new Error('JWT_SECRET is not defined'));
    }
    // Create a new user in the database using the data from the request body .create is like save in mongoose but it also returns the created document
    const token = jwt.sign({ id: newUser._id, name: newUser.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})
// LOGIN
export const login = catchAysncFunction(async (req, res, next) => {
    console.log('Login function called' + req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError('Please provide email and password', 400));
    }
    // Find the user by email and include the password field in the query result (since it's set to select: false in the schema)
    const user = await userModel.findOne({ email }).select('+password');
    const correct = user && await user.correctPassword(password, user.password);
    if (!correct) {
        return next(new appError('Incorrect email or password', 401));
    }
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })  
})
