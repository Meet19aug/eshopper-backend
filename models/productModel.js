const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name:{
        type: String,
        required:[true, "Please Enter Product Name"],
        trim:true,
    },
    description:{
        type:String,
        required:[true, "Please Enter Product Description"]
    },
    price:{
        type:Number,
        required:[true, "Please Enter Product Price"],
        maxLength:[8,"Price can not exceed 8 digits"]
    },
    rating:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            uri:{
                type:String,
                required:true
            }
        },
    ],
    category:{
        type:String,
        required:[true, "Please Enter Product Catagory"],
    },
    Stock:{
        type:Number,
        required:[true, "Please Enter Product Stock"],
        maxLength:[4,"Stock can not excees 4 characters"],
        default:1,
    },
    numOfReviews:{
        type:Number,
        default:0,
    },
    reviews:[
        {
            name:{
                type: String,
                required: true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
})


module.exports = mongoose.model("Product", productSchema);