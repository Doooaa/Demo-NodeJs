import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tourrouter from "./routes/tour.route.js"
import userRouter from "./routes/user.route.js"
import GlobalErrHandeler from './controllers/error.controller.js';
import AppError from './utils/AppError.js';
import rateLimit from "express-rate-limit";
import helmet from 'helmet';
import mongoSanitize from '@exortek/express-mongo-sanitize';
import reviewRouter from './routes/review.route.js';
import cookieParser from 'cookie-parser';

import xss from 'xss-clean';
dotenv.config();
const app = express();

app.use(cookieParser());


// 👉🚨Data sanitization against NoSQL query injection

app.use(mongoSanitize());
//app.use(ExpressMongoSanitize());
// 👉🚨Data sanitization against XSS( Cross-Site Scripting ) attacks
// app.use(xss());

// 👉🚨body parser, reading data from body into req.body

app.use(express.json({ limit: '10kb' })); //  💡to limit the size of the request body to 10kb to prevent DoS attacks
app.use(express.urlencoded({ extended: true }));
app.set('query parser', 'extended');  // 💡 Enable proper query parsing


// 👉🚨Security middleware
app.use(helmet());

// 👉🚨Implement rate limiting to prevent brute-force attacks and DDoS attacks
const limiter=rateLimit({
    max:100, // limit each IP to 100 requests per windowMs
    windowMs:60*60*1000, // 1 hour
    message:'Too many requests from this IP, please try again in an hour!' // message to send when rate limit is exceeded
});
 app.use(limiter); 


// 👉🚨Mounting the routers
app.use("/tour",Tourrouter);
app.use("/user",userRouter);
app.use("/review",reviewRouter);


// 👉🚨 Handle unhandled routes
app.use((req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl} on this server`,404));
});

//👉🚨 Global Error Handling Middleware
app.use(GlobalErrHandeler)

mongoose.connect(process.env.MONGO_URI)
  .then( () => {
    console.log('✅ MongoDB connected successfully');
    
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

// 👉🚨 Handle unhandled promise rejections globally
process.on('unhandledRejection',err=>{
  console.error('UNHANDLED REJECTION!👁️ Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
})


app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
