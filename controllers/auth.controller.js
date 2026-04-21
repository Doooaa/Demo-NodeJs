import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import catchAysncFunction from "../utils/catchAysnc.js";
import appError from "../utils/AppError.js";
import env from "dotenv";
import { promisify } from 'util'; // to convert callback-based functions to promise-based functions
import { sendEmail } from "../utils/email.js";
env.config();
import crypto from 'crypto'; // to generate random bytes for password reset token
import User from "../models/user.model.js";


// create signUp token function to create a token for the user after signing up or logging in
const signToken = (id, name) => {
    return jwt.sign({ id, name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}
// SIGNUP
export const singUp = catchAysncFunction(async (req, res, next) => {
    
    const newUser = await userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role,
        photo: req.body.photo
    });
    if (!process.env.JWT_SECRET) {
        return next(new Error('JWT_SECRET is not defined'));
    }
    // Create a new user in the database using the data from the request body .create is like save in mongoose but it also returns the created document
    const token = jwt.sign({ id: newUser._id, name: newUser.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const cookieOptions =
    {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    }
    res.cookie("jwt", token, cookieOptions)
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // Send cookie only on HTTPS in production
    // In production, also set the cookie to be HTTP only to prevent client-side JavaScript from accessing it
    if (process.env.NODE_ENV === 'production') cookieOptions.httpOnly = true;
    newUser.password=undefined; // 🚨to hide the password field in the response

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
    //save the token in a cookie
    const cookieOptions =
    {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    }
    res.cookie("jwt", token, cookieOptions)
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // Send cookie only on HTTPS in production
    // In production, also set the cookie to be HTTP only to prevent client-side JavaScript from accessing it
    if (process.env.NODE_ENV === 'production') cookieOptions.httpOnly = true;
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
})


// PROTECT MIDDLEWARE
export const protect = catchAysncFunction(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        // console.log('Token from protect middleware:', req.headers.authorization);
    }
    //✅ Also check if the token is in the cookies (for browser-based clients that store the token in cookies)
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError('You are not logged in! Please log in to get access.', 401));
    }
    // Verify the token and decode it to get the user ID
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Find the user by ID and check if the user still exists
    const currentUser = await userModel.findById(decoded.id);
    if (!currentUser) {
        return next(new appError('The user belonging to this token does no longer exist.', 401));
    }
    req.user = currentUser;

    next();
});

export const restricTo = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return next(new appError('You do not have permission to perform this action', 403));
        }
        next();
    }
}


export const forgotPassword = catchAysncFunction(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError('There is no user with that email address.', 404));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/user/resetPassword/${resetToken}`;
    const html = `
<div style="font-family: Arial; padding:20px">
  <h2>Password Reset</h2>
  <p>You requested to reset your password</p>

  <a href="${resetURL}" 
     style="
        background:#4CAF50;
        color:white;
        padding:10px 20px;
        text-decoration:none;
        border-radius:5px;">
     Reset Password
  </a>

  <p>If you didn't request this please ignore this email.</p>
</div>
`;
    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
        console.log("before email==========");

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            html
        })

        console.log("after email===========");

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
            user
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new appError('There was an error sending the email. Try again later!', 500));
    }
})


export const resetPassword = catchAysncFunction(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    // console.log("Token from params:", req.params.token);
    // console.log("Hashed token:", hashedToken);
    const user = await userModel.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    // 2) If token has not expired, and there is user, set the new password

    if (!user) {
        return next(new appError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    // 3) Update changedPasswordAt property for the user (implemented in user model pre save middleware)
    // 4) Log the user in, send JWT
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(200).json({
        status: 'success',
        token
    });
});
