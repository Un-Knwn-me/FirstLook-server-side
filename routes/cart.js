var express = require("express");
const { UserModel } = require("../models/userSchema");
var router = express.Router();

router.post("/addcart", async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

    // Check if the required datas are provided
    if (!userId || !productId || !quantity) {
        return res.status(400).json({ message: 'Bad Request - Missing product data' });
      }

    // Find the user by userId
    let user = await UserModel.findOne({ _id: userId });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the product already exists in the user's cart
    const existingProduct = user.cart.findIndex((item) => item.productId === productId);

    if (existingProduct >= 0) {
        user.cart[existingProduct].quantity += quantity;
      } else {
        user.cart.push({ productId, quantity });
      }
      await user.save();

      res.status(200).json({ message: 'Product added to cart', cart: user.cart });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
})

module.exports = router;