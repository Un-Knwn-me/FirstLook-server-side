var express = require("express");
const { UserModel } = require("../models/userSchema");
const { isSignedIn } = require("../middlewares/adminAuth");
var router = express.Router();


// Get cart items
router.get('/getProducts', isSignedIn, async(req, res) => {
  try {
    const {_id} = req.user;

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Your cart items', cart: user.cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
})

// add to cart
router.post("/addcart", isSignedIn, async (req, res) => {
    try {
        const {_id} = req.user;        
        const { productId, quantity } = req.body;

    if (!_id || !productId || !quantity) {
        return res.status(400).json({ message: 'Bad Request - Missing product data' });
      }

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the product already exists in the user's cart
    const existingProduct = user.cart.findIndex((item) => String(item.productId) === String(productId));

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

// remove from cart
router.post("/removecart", async (req, res) => {
  try {
    const {_id} = req.user;  
    const { productId } = req.body;

    if (!_id || !productId) {
      return res.status(400).json({ message: 'Bad Request - Missing product data' });
    }

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the product which matches id
    user.cart = user.cart.filter((item) => String(item.productId) !== String(productId));
    await user.save();

    res.status(200).json({ message: 'Product removed from cart', cart: user.cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});


module.exports = router;