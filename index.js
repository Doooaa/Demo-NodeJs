import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tourrouter from "./routes/tour.route.js"
import AppError from './utils/AppError.js';
import errorControllerHandeler from './controllers/error.controller.js';
dotenv.config();
const app = express();
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.set('query parser', 'extended');  //Enable proper query parsing

app.use("/tour",Tourrouter);
app.use((req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`Can't find ${req.originalUrl} on this server`
    // })

    // 🔰 ✅instead of this create error object✅
    // const err=new Error(`can't find ${req.originalUrl} on this server`);
    // err.status='fail';
    // err.statusCode=404;
    // next(err); //forward to error handling middleware

    next(new AppError(`can't find ${req.originalUrl} on this server`,404));
});
app.use(errorControllerHandeler)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
