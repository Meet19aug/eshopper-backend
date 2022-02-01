const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorhHndler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhandler");

//Create new Order
exports.newOrder = catchAsyncError(async (req, res, next) => {

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});

// Get Single Order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {

    // Here populate method used for taking userId from order and finging user's name & Email from our database.
    const order = await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHandler("Order not found with this given Id",404));
    }

    res.status(200).json({
        success:true,
        order,
    });
});



// Get logged In user Order
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }); 

    res.status(200).json({
        success:true,
        orders,
    });
});

// Get all Order -- Admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find(); 

    let totalAmount = 0;
    
    orders.forEach((order)=>{
        totalAmount += order.totalPrice;
    })
     
    res.status(200).json({
        success:true,
        totalAmount,
        orders
    });
});


//Update Order Status -- Admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id );
    
    if(!order){
        return next(new ErrorHandler("Order not found with this given Id",404));
    }
    
    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("You have already delivered this product.",400));
    }

    // For Updating Stock as product is delivered from the main warehouse
    if(req.body.status === "Shipped"){
        order.orderItems.forEach(async (order)=>{
            await updateStock(order.product, order.quantity);
        });
    }
    
    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave: false})

    res.status(200).json({
        success:true,
    });    
});

// UpdateStock Function used Above
async function updateStock (id,quantity){
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({validateBeforeSave: false})   
} 


// Delete Order -- Admin
exports.deleteOrders = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id); 
    
    if(!order){
        return next(new ErrorHandler("Order not found with this given Id",404));
    }
    await order.remove();
     
    res.status(200).json({
        success:true,
    });
});

