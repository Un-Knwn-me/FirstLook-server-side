var express = require("express");
var router = express.Router();
const razorpay = require("../config/razorpayClient");
const crypto = require("crypto");
const OrderModel = require("../models/orderSchema");
const { isSignedIn } = require("../middlewares/adminAuth");
const { UserModel } = require("../models/userSchema");

// initiating the razorpay and generate raz_orderId
router.post("/initiate", async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order by orderId
    let orders = await OrderModel.find({ _id: orderId });

    const subTotalAmount = orders[0].totalAmount * 100;

    // options
    const options = {
      amount: subTotalAmount,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);
    console.log(response);
    res.status(200).json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Verify the payment after the payment done
router.post("/verify", isSignedIn, async (req, res) => {
  try {
    const { order, paymentMethod } = req.body;
    const { _id } = req.user;
    // find the user;s oreder by id
    const updatedOrder = await OrderModel.findById({ _id: order });

    if (
      req.body.orderDetails == undefined ||
      req.body.orderDetails == "timeout" ||
      req.body.paymentMethod === null
    ) {
      updatedOrder.paymentDetails.paymentStatus = "Cancelled";
      await updatedOrder.save();
      return res.status(307).send({ message: "Order payment was Cancelled" });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body.orderDetails;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.Razorpay_Secret_Key)
      .update(sign)
      .digest("hex");

    updatedOrder.paymentDetails.razorpay_order_id = razorpay_order_id;
    updatedOrder.paymentDetails.razorpay_payment_id = razorpay_payment_id;
    updatedOrder.paymentDetails.razorpay_signature = razorpay_signature;
    updatedOrder.paymentDetails.paymentMethod = paymentMethod;
    updatedOrder.paymentDetails.paymentStatus =
      razorpay_signature === expectedSign ? "Completed" : "Failed";
    await updatedOrder.save();

    if (razorpay_signature === expectedSign) {
      let user = await UserModel.findOne({ _id: _id });
      user.cart = [];
      await user.save();
      return res
        .status(200)
        .json({ message: "Payment verified successfully", updatedOrder });
    } else {
      updatedOrder.paymentDetails.paymentStatus = "Failed";
      await updatedOrder.save();
      return res.status(400).json({ message: "Invalid Signature sent!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Webhook to capture payment
router.post("/capture-payment", async (req, res) => {
  const { paymentId, orderId } = req.body;
  try {
    const payment = await razorpay.payments.capture(paymentId, orderId);
    res.json({ status: payment.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error capturing payment" });
  }
});

module.exports = router;
