//instantiate custom error class for operational errors like invalid user inputs etc. 
class AppError extends Error {
    constructor(message,statusCode){
        console.log('from utils / AppError message:', message);
        super(message);
        this.statusCode=statusCode;
        this.status=`${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational=true;
        Error.captureStackTrace(this,this.constructor);
    }
}

export default AppError;