var express = require('express');
var router = express.Router();
const razorpay = require('../config/razorpayClient');
const crypto = require('crypto');
const OrderModel = require('../models/orderSchema');

router.post("/initiate", async(req, res) => {
    try {
    const { orderId } = req.body;

    // Find the order by orderId
    let orders = await OrderModel.find({ _id: orderId });

    const subTotalAmount = orders[0].subTotalAmount*100;

    // options
    const options = {
        amount: subTotalAmount,
        currency: 'INR',
        receipt: crypto.randomBytes(10).toString('hex'),
        payment_capture: 1
        };

    const response = await razorpay.orders.create(options)
        res.status(200).json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", error });  
    }
})

router.post('/capture-payment', async (req, res) => {
    const { paymentId, orderId } = req.body;
    try {
      const payment = await razorpay.payments.capture(paymentId, orderId);
      res.json({ status: payment.status });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error capturing payment' });
    }
});

router.post('/verify', async(req, res) => {
    try {
        // const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const signature = req.headers['x-razorpay-signature']
        // const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.Webhook_SecretKey).update(sign.toString()).digest("hex");

        if(signature === expectedSign) {
            return res.status(200).json({message: "Payment verified successfully"})
        } else {
            return res.status(400).json({message: "Invalid Signature sent!"})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", error });  
    }
})

module.exports = router;