const ErrorhHndler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/errorhandler");
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto");
const cloudinary = require("cloudinary");

//Register a User
exports.registerUser = catchAsyncError(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop : "scale",
    });
    const { name, email, password } = req.body;
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
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
    
    //To save reset token temporary in the database.
    await user.save({ validateBeforeSave: false });

    // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;


    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email than please ignore it.`

    try {
        await sendEmail({
            email:user.email,
            subject:`EShopper Password Recovery`,
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
});

// Reset Password 
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    // Creating token hash Refer: User Model for below line Code Reusability.
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:  Date.now() }

    })

    
    if (!user) {
        return next(new ErrorhHndler("Reset Password Token is invalid or has been expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorhHndler("Password does not match", 400));

    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200,res);
});

// Get User Detail
// This will only run if user is login,
exports.getUserDetails = catchAsyncError(async(req,res,next)=>{

    const user=await User.findById(req.user.id);
    // User is Login so we get all user details from req.user REFER: auth.js

    res.status(200).json({
        success: true,
        user,
    });
    
});


// Update User Password
// This will only run if user is login,
exports.updatePassword = catchAsyncError(async(req,res,next)=>{
    
    //WARNING:  const { oldPassword, newPassword, confirmPassword } = req.body; as user password confidentaility is lost due to this.

    const user=await User.findById(req.user.id).select("+password");
    // User is Login so we get all user details from req.user REFER: auth.js

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorhHndler("Invalid old-password", 401));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorhHndler("Password Doesn't Matched", 401));
    }

    user.password=req.body.newPassword;

    await user.save();
    sendToken(user,200,res);
    
});


// Update User Detail
// This will only run if user is login,
exports.updateProfile = catchAsyncError(async(req,res,next)=>{
    const newUserData={
        email: req.body.email,
        name: req.body.name,
    };
    
    if(req.body.avatar !== ""){
        const user=await User.findById(req.user.id);
        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop : "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }

    }

    const user= await User.findByIdAndUpdate(req.user.id, newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
    });
    
});

// Get All User (admin)
exports.getAllUser = catchAsyncError(async(req,res,next)=>{
    const users=  await User.find();
    
    res.status(200).json({
        success: true,
        users,
    })
})

// Get Single User (admin)
exports.getSingleUser = catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User Does not exist with id: ${req.params.id}`,404));
    }

    res.status(200).json({
        success: true,
        user,
    })
})

// Update User Role (admin)
exports.updateUserRole = catchAsyncError(async(req,res,next)=>{
    
    const newUserData={
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };
    
    await User.findByIdAndUpdate(req.params.id, newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
        message:"User Role Updated"
    });
    
});

// delete User  (admin)
exports.deleteUser = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User Does not exist with id: ${req.params.id}`,404));
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success: true,
        message:"User Deleted successfully."
    });
    
});




