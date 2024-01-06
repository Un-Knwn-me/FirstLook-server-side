const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            varientId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products.variants',
            },
            quantity: {
                type: Number,
                required: true
            },
            
        }
    ],
    totalItems: {
        type: Number,
        required: true
    },
    subTotalAmount: {
        type: Number,
        required: true
    },
    shippingCharge: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentDetails: {
        paymentMethod: {
            type: String
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending'
        },
        paymentId: {
            type: String
        },
        transactionId: {
            type: String
        },    
    },
    deliveryAddress: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        building: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        landmark: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    orderDate: {
        type: Date,
        default: Date.now(),
        required: true
    },
    trackingId: {
        type: String
    },
    deliveryStatus: {
        type: String,
        enum: ['Dispatched', 'Completed', 'Returned', 'Refunded', 'Pending'],
        default: 'Pending'
    },
    deliveredDate: {
        type: Date
    },
}, { versionKey: false, collection: "orders" });

const OrderModel = mongoose.model('orders', orderSchema);
module.exports = OrderModel;