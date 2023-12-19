const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: `${process.env.Razorpay_Key_id}`,
    key_secret: `${process.env.Razorpay_Secret_Key}`
});

module.exports = razorpay;