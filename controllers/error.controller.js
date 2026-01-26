
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message || 'Internal Server Error',
    stack: err.stack,
  });
}

const sendErrorProd = (err, res) => {
if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
}}


export default (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);

  } else {
    sendErrorDev(err, res);
  }
}   