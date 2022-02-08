const Product = require("../models/productModel");
const ErrorhHndler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");


//Create Product -- Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
    req.body.user = req.user.id;

    let images = [];
    if (typeof req.body.images === "string") { // if there are only one image than condition true if more than one than else part execute
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], { folder: "products" });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        })
    }
    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product,
    });
});

//get All  Products
exports.getAllProducts = catchAsyncError(async (req, res) => {
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter();

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });

});

//get All  Products (ADMIN)
exports.getAdminProducts = catchAsyncError(async (req, res) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });

});

//Get Product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorhHndler("Product not found.", 404));
    }
    res.status(200).json({
        success: true,
        product,
    });
});

// Update Product -- Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorhHndler("Product not found.", 404));
    }

    let images = [];
    if (typeof req.body.images === "string") { // if there are only one image than condition true if more than one than else part execute
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }
        const imagesLinks = [];
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], { folder: "products" });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            })
        }
        req.body.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

// Delete Product -- Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorhHndler("Product not found.", 404));
    }
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    });
});

// Create a new Review or update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    // isReviewed is finding in review user id is same as login id <Refer : productModel.js>
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    } else {
        // This will push review in reviews stack or array and then count the length of array.
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    //overall comman rating for product ratings overall, rating for one user rating
    let avg = 0;
    product.ratings = product.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;
    // console.log("final Rating: " + product.ratings + "   product.reviews.length: " + product.reviews.length);

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});

// Get All Review of Product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorhHndler("Product not found.", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// Delete Review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorhHndler("Product not found.", 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    //overall New Updated comman rating for product ratings overall, rating for one user rating
    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings=0;
    if(reviews.length===0){
        ratings=0;
    }else{
        ratings = avg / reviews.length;
    }
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});
