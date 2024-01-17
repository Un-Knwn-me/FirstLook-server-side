var express = require("express");
var router = express.Router();
const { isSignedIn } = require("../middlewares/adminAuth");
const { UserModel } = require("../models/userSchema");
const OrderModel = require("../models/orderSchema");
const { ProductModel } = require("../models/productSchema");

// Create order
router.post("/createOrder", isSignedIn, async (req, res) => {
  try {
    const { _id } = req.user;
    const { shippingAddress, totalItems, subTotalAmount, shippingCharge } =
      req.body;

    const totalAmount = (await subTotalAmount) + shippingCharge;

    if (totalAmount < 150 && shippingCharge < 30) {
      return res.status(404).json({ message: "Error login again" });
    }

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the productId from the cart
    const products = user.cart.map((item) => item);
    await Promise.all(products);

    for(i=0; i<products.length; i++){
      const prodId = products[i].productId;
      const prodData = await ProductModel.find({ _id: { $in: prodId } });
      const prodImg = await prodData[0].images[0];
      const prodName = await prodData[0].productName;
      const prodCategory = await prodData[0].category;

      products[i] = {
        ...products[i],
        prodImg,
        prodName,
        prodCategory
      };
    }

    // Get deliveryAddress
    const deliveryAddress = user.address.find((address) =>
      address._id.equals(shippingAddress)
    );

    let data = new OrderModel({
      user: _id,
      products,
      totalItems,
      subTotalAmount,
      deliveryAddress,
      shippingCharge,
      totalAmount,
    });
    
    await data.save();

    res.status(200).json({ message: "Order created success", orderId: data._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// get order by id
router.get("/getOrder/:orderId", isSignedIn, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await OrderModel.findById({ _id: orderId });   
    res.status(200).json({ message: 'Order details fetched', orderInfo: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;