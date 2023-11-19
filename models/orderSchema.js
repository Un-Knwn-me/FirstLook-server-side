const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    transactionId: {
        type: String
    },
    deliveryAddress: {
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
        state: {
            type: String,
            required: true
        },
        pinCode: {
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
        default: Date.now()
    },
    trackingId: {
        type: String
    },
    deliveryStatus: {
        type: String,
        enum: ['Dispatched', 'Completed', 'Returned', 'Refunded', 'Pending'],
        default: 'Pending'
    },
}, { versionKey: false, collection: "orders" });

const OrderModel = mongoose.model('orders', orderSchema);
module.exports = OrderModel;