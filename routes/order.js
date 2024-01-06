var express = require('express');
var router = express.Router();
const { isSignedIn } = require('../middlewares/adminAuth');
const { UserModel } = require('../models/userSchema');
const OrderModel = require('../models/orderSchema');

// Create order
router.post('/createOrder', isSignedIn, async(req, res) => {
    try {
        const { _id } = req.user;
        const {shippingAddress, totalItems, subTotalAmount, shippingCharge} = req.body;
        
        const totalAmount = await subTotalAmount+shippingCharge;

        if(totalAmount < 150 && shippingCharge < 30) {
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
    
    // Get deliveryAddress
    const deliveryAddress = user.address.find((address) => address._id.equals(shippingAddress));

    let data = new OrderModel({ user: _id, products, totalItems, subTotalAmount, deliveryAddress, shippingCharge, totalAmount});
    await data.save();
    
    res.status(200).json({ message: "Order created success", orderId: data._id })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", error });          
    }
})


module.exports = router;