const ErrorHandler = require("../utils/errorhandler")


module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong MongoDb Id Error -- if we give short id or invalid id then error is thrown from MongoDb itself
    if(err.name === "CastError"){
        const message = `Resource not found, Invalid : ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose Duplicate key Error:
    //"message": "E11000 duplicate key error collection: Eshopper.users index: email_1 dup key: { email: \"meet007@gmail.com\" }"
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandler(message, 400);
    }

    //Json Web Token Error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is Invalid, Try again `;
        err = new ErrorHandler(message, 400);
    }

    //JWT Expire Error
    if(err.name === "TokenExpiredError"){
        const message = `Json Web Token is Expired, Try again `;
        err = new ErrorHandler(message, 400);
    }
    
    res.status(err.statusCode).json({
        success:false,
        message: err.message
    })
}