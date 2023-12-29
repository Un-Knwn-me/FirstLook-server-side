const { mongoose } = require("mongoose");

const reviewSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    rating:{
        type: Number,
        required: true
    },
    Comment:{
        type: String,
        required: true
    }
},{timestamps: true})

const productSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: [true, 'Please Enter the SKU!'],
        trim: true
    },    
    productName: {
        type: String,
        required: [true, 'Please Enter the Product Name!'],
        trim: true
    },
    brandName: {
        type: String,
        required: [true, 'Please Enter the Brand Name!'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please Enter the Product Category'],
    },
    productType: {
        type: String,
        required: [true, 'Please Enter the Product Type'],
        trim: true
    },
    color: {
        type: String,
        required: [true, 'Please Enter the Product Color'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please Enter the Product Price!'],
        trim: true
    },            
    salesPrice: {
        type: Number,
        required: [true, 'Please Enter the Sales Price!'],
        trim: true
    },
    tag: {
        type: String,
        enum: {
            values: [ 'Best Selling', 'New', 'Popular', 'Fast Selling', 'Featured', 'Offer', 'Discount' ],
            message: 'Please Select the Correct Tag!'
        }
    },
    varients: [
        {
            size: {
                type: String,
                required: [true, 'Please Enter the Product Size'],
                trim: true
            },
            stock: {
                type: Number,
                required: [true, "Please Enter Product Stock Count!"],
            },
        }
    ],
    fabric: {
        type: String,
        required: [[true, "Please Enter Product Fabric!"]],
    },
    style: {
        type: String,
        required: [[true, "Please Enter Product Style!"]],
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    description: {
        type: String,
        required: [true, 'Please Enter the Product Description!'],
    },
    notes: {
        type: String,
        required: [true, 'Please Enter Notes!']
    },
    yLink: {
        type: String,
        required: [true, 'Please Enter Youtube Link!']
    },
    care: {
        type: String,
        required: [true, 'Please Enter Material and Care!']
    },
    ratings: {
        type: Number,
        default: 0
    },
    reviews:[reviewSchema], 
    numOfReviews: {
        type: Number,
        default: 0
    },       
    status: {
        type: Boolean,
        default: true
    },
    publish: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
},{versionKey: false, collection:"products"})

const ProductModel = mongoose.model('products', productSchema)
module.exports = { ProductModel };