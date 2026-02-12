import appError from '../utils/appError.js';
 // Handle specific database errors mongoose errors #id
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new appError(message, 400); //400 Bad Request
}


const handleDuplicateFieldsDB=(err)=>{
  const value =err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
}

const handleValidationErrorDB=(err)=>{
  const errors = Object.values(err.errors).map(value=>value.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new appError(message, 400);
}
// Send error details in development environment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message || 'Internal Server Error',
    stack: err.stack,
  });
}

// Send error shorter  in production environment with operational check
const sendErrorProd = (err, res) => {
if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else { 
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    console.error(`${err.isOperational} this is not operational error`);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
}}


export default (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    let error = err;//Object.create(err); // to properly copy the error object with its properties
    if(error.name=='CastError') error=handleCastErrorDB(error);
    // if error code is 11000 it means it's a duplicate key error in mongoose
    if(error.code==11000) error=handleDuplicateFieldsDB(error);
    // if error name is ValidationError it means it's a validation error in mongoose
    if(error.name=='ValidationError') error=handleValidationErrorDB(error);

    sendErrorProd(error, res);
  } else {
    sendErrorDev(err, res);
  }
}   