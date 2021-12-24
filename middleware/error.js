const ErrorHandler = require("../utils/errorhandler")

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong MongoDb Id Error -- if we give short id or invalid id then error is thrown from MongoDb itself
    if(error.name === "CastError"){
        const message = `Resource not found, Invalid : ${err.path}`;
        err = new ErrorHandler(message, 400);
    }
    
    res.status(err.statusCode).json({
        success:false,
        message: err.message
    })
}