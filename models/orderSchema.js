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
            prodImg: {
                type: String,
                required: true
            },
            prodName: {
                type: String,
                required: true
            },
            prodCategory: {
                type: String,
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
            selectedSize: {
                type: String,
                required: true
            },
            salesPrice: {
                type: Number,
                required:true
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
        razorpay_payment_id: {
            type: String
        },
        razorpay_order_id: {
            type: String
        },
        razorpay_signature: {
            type: String
        },
         paymentMethod: {
            type: String
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
            default: 'Pending'
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
    trackingSite: {
        type: String
    },
    deliveryStatus: {
        type: String,
        enum: [ 'Pending', 'Confirmed', 'Dispatched', 'On the way', 'Delivered', 'Returned', 'Failed'],
        default: 'Pending'
    },
    deliveredDate: {
        type: Date
    },
}, { versionKey: false, collection: "orders" });

const OrderModel = mongoose.model('orders', orderSchema);
module.exports = OrderModel;