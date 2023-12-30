var express = require("express");
var router = express.Router();
const { UserModel } = require("../models/userSchema");
const { isSignedIn } = require("../middlewares/adminAuth");
const { ProductModel } = require("../models/productSchema");

// Add to cart
router.post("/addToCart", isSignedIn, async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId, quantity, salesPrice, price, varientId, selectedSize } = req.body;

    if (!_id || !varientId || !selectedSize) {
      return res
        .status(400)
        .json({ message: "Missing product data - Select Varients" });
    }

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product already exists in the user's cart
    const existingProduct = user.cart.findIndex(
      (item) => String(item.productId) === String(productId)
    );
    
    const existingVarient = user.cart.findIndex(
      (item) => String(item.varientId) === String(varientId)
    );

    if (existingProduct < 0 && existingVarient < 0 ) {
      user.cart.push({ productId, quantity, salesPrice, price, varientId, selectedSize });
    } else if(existingVarient < 0) {
      user.cart.push({ productId, quantity, salesPrice, price, varientId, selectedSize });
    } else {
      user.cart[existingProduct].quantity += quantity;
    }
console.log('user: ', user);
    await user.save();

    res.status(200).json({ message: "Item added to cart successfully", cart: user.cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});


// Get cart items
  router.get("/getProducts", isSignedIn, async (req, res) => {
    try {
      const { _id } = req.user;

      // Find the user by userId
      let user = await UserModel.findOne({ _id: _id });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get the productId from the cart
      const productIds = user.cart.map((item) => item.productId);
      await Promise.all(productIds);
      // Get the productDetails using productIds
      const products = await ProductModel.find({ _id: { $in: productIds } });

      // Map product details from the user's cart with quantity and size
      const cartDetailsPromises = user.cart.map((cartItem) => {
        const productDetail = products.find((product) => product._id.equals(cartItem.productId)
        );

        const stockItem = productDetail.varients.find((stock) => stock._id.equals(cartItem.varientId)
        );

        return {
          _id: cartItem._id,
          product: productDetail,
          quantity: cartItem.quantity,
          salesPrice: cartItem.salesPrice,
          price: cartItem.price,
          selectedSize: cartItem.selectedSize,
          varientId: cartItem.varientId,
          varient: stockItem
        };
      });
      const cartDetails = await Promise.all(cartDetailsPromises);
  
      res
        .status(200)
        .json({
          message: "Your cart items",
          cart: cartDetails,
          userAddress: user.address,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  });

// get address
router.post("/addAddress", isSignedIn, async (req, res) => {
  try {
    const { _id } = req.user;
    const newAddress = req.body;

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // let data = new user.address(req.body);
    user.address.push(req.body);
    await user.save();

    res
      .status(200)
      .json({
        message: "Address added successfully",
        userAddress: user.address,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// change quantity in cart
router.put("/changeQuantity", isSignedIn, async (req, res) => {
  try {
    const { _id } = req.user;
    const { cartId, quantity } = req.body;

    if (!_id || !cartId || !quantity) {
      return res
        .status(400)
        .json({ message: "Bad Request - Missing product data" });
    }

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product already exists in the user's cart
    const existingProduct = user.cart.findIndex(
      (item) => String(item._id) === String(cartId)
    );

    // change the quantity
    user.cart[existingProduct].quantity = quantity;
    await user.save();

      // Get the productId from the cart
      const productIds = user.cart.map((item) => item.productId);
      await Promise.all(productIds);
      // Get the productDetails using productIds
      const products = await ProductModel.find({ _id: { $in: productIds } });

      // Map product details from the user's cart with quantity and size
      const cartDetailsPromises = user.cart.map((cartItem) => {
        const productDetail = products.find((product) => product._id.equals(cartItem.productId)
        );

        const stockItem = productDetail.varients.find((stock) => stock._id.equals(cartItem.varientId)
        );

        return {
          _id: cartItem._id,
          product: productDetail,
          quantity: cartItem.quantity,
          salesPrice: cartItem.salesPrice,
          price: cartItem.price,
          selectedSize: cartItem.selectedSize,
          varientId: cartItem.varientId,
          varient: stockItem
        };
      });
      const cartDetails = await Promise.all(cartDetailsPromises);
    res
      .status(200)
      .json({ message: "Product added to cart", cart: cartDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// remove from cart
router.delete("/removecart/:cartId", isSignedIn, async (req, res) => {
  try {
    const { _id } = req.user;
    const { cartId } = req.params;

    if (!_id || !cartId) {
      return res
        .status(400)
        .json({ message: "Bad Request - Missing product data" });
    }

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.cart.pull({ _id: cartId });

    await user.save();

          // Get the productId from the cart
          const productIds = user.cart.map((item) => item.productId);
          await Promise.all(productIds);
          // Get the productDetails using productIds
          const products = await ProductModel.find({ _id: { $in: productIds } });
    
          // Map product details from the user's cart with quantity and size
          const cartDetailsPromises = user.cart.map((cartItem) => {
            const productDetail = products.find((product) => product._id.equals(cartItem.productId)
            );

            const stockItem = productDetail.varients.find((stock) => stock._id.equals(cartItem.varientId)
            );

            return {
              _id: cartItem._id,
              product: productDetail,
              quantity: cartItem.quantity,
              salesPrice: cartItem.salesPrice,
              price: cartItem.price,
              selectedSize: cartItem.selectedSize,
              varientId: cartItem.varientId,
              varient: stockItem
            };
          });    
          const cartDetails = await Promise.all(cartDetailsPromises);
    res
      .status(200)
      .json({ message: "Product removed from cart", cart: cartDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});
  // // Remove the product which matches id
    // user.cart = user.cart.filter(
    //   (item) => String(item.productId) !== String(productId)
    // );
    // await user.save();
module.exports = router;