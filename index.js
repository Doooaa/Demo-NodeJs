import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tourrouter from "./routes/tour.route.js"

import GlobalErrHandeler from './controllers/error.controller.js';
dotenv.config();
const app = express();
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.set('query parser', 'extended');  //Enable proper query parsing

app.use("/tour",Tourrouter);
// Handle unhandled routes
app.use((req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl} on this server`,404));
});
// Global Error Handling Middleware
app.use(GlobalErrHandeler)

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
