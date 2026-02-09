import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import catchAysncFunction from "../utils/catchAysnc.js";
import appError from "../utils/AppError.js";
import env from "dotenv";
env.config();
// SIGNUP
export const singUp = catchAysncFunction(async (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        return next(new Error('JWT_SECRET is not defined'));
    }
    const newUser = await userModel.create(req.body);
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
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError('Please provide email and password', 400));
    }
    const user = await userModel.findOne({ email }).select('+password');
})
