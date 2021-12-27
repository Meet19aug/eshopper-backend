const ErrorhHndler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/errorhandler");
const sendEmail = require("../utils/sendEmail.js")


//Register a User
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await User.create({
        name, email, password,
        avtar: {
            public_id: "this is sample public id",
            url: "profile url"
        }
    });
    //Utility send token jwtToken 
    sendToken(user, 201, res);
})

//Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    //checking if user has given password and email both

    if (!email || !password) {
        return next(new ErrorhHndler("Please enter email and password.", 400))
    }

    // Here we made select: false, in user model so use +password inside find method
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorhHndler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorhHndler("Invalid email or password", 401));
    }

    //Utility send token jwtToken
    sendToken(user, 200, res)

})


// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Logged Out Successfully."
    })
})

//Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    //Get Reset Password Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email than please ignore it.`

    try {
        await sendEmail({
            email:user.email,
            sunject:`EShopper Password Recovery`,
            message,
        });

        res.status(200).json({
            success:true,
            message:`Email send to ${user.email} Successfully`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));

    }
})

