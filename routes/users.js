var express = require("express");
const {
  hashPassword,
  createToken,
  hashCompare,
} = require("../controllers/auth");
const { UserModel } = require("../models/userSchema");
const { isSignedIn } = require("../middlewares/adminAuth");
const OrderModel = require("../models/orderSchema");
const { ProductModel } = require("../models/productSchema");
var router = express.Router();

// signup user
router.post("/signup", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      req.body.password = await hashPassword(req.body.password);
      let data = new UserModel(req.body);
      await data.save();
      res.status(200).json({ message: "User signed up successfully" });
    } else {
      res.status(401).json({ message: "User already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// signin user
router.post("/signin", async (req, res) => {
  try {
    const { userVerify, password } = req.body;
    let user = await UserModel.findOne({
      $or: [{ phone: userVerify }, { email: userVerify }],
    });

    if (user) {
      if (await hashCompare(password, user.password)) {
        let token = createToken({
          _id: user._id,
          name: user.name,
          shirtSize: user.shirtSize,
          hipSize: user.hipSize,
        });

        res
          .status(200)
          .json({
            message: "User successfully logged in",
            token,
            userName: user.name,
            userId: user._id,
            wishlist: user.wishlist,
            cartItems: user.cart,
          });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Add to wishlist
router.post("/wishlist/add", isSignedIn, async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId, varientId, selectedSize } = req.body;

    // Find the user by userId
    let user = await UserModel.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product already exists in the user's cart
    const existingProduct = user.wishlist.findIndex(
      (item) => String(item.productId) === String(productId)
    );

    if (existingProduct === -1) {
      const wishlistItem = { productId };
      if (varientId && selectedSize) {
        wishlistItem.varientId = varientId;
        wishlistItem.selectedSize = selectedSize;
      }
      user.wishlist.push(wishlistItem);
      await user.save();
      return res
        .status(200)
        .json({
          message: "Product added to wishlist",
          wishlist: user.wishlist,
        });
    } else {
      user.wishlist.splice(existingProduct, 1);
      await user.save();
      return res
        .status(200)
        .json({
          message: "Product removed from wishlist",
          wishlist: user.wishlist,
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// get wishlists
router.get("/wishlistItems", isSignedIn, async (req, res) => {
  try {
    const userId = req.user;

    // Get user's wishlist by ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wishlist = user.wishlist;

    // Fetch product details for each item in the wishlist
    const wishlistItems = await Promise.all(
      wishlist.map(async (wishlistItem) => {
        const product = await ProductModel.findById(wishlistItem.productId);
        if (!product) {
          return null;
        }

        // set the selected varient and seleccted Size as null if it is undefined
        const selectedVarient = wishlistItem.varientId ? wishlistItem.varientId : null;
        const selectedSize = wishlistItem.selectedSize ? wishlistItem.selectedSize : null;

        return {
          product: product,
          selectedVarient: selectedVarient,
          selectedSize: selectedSize,
        };
      })
    );

    // Remove null values (products not found)
    const filteredWishlistItems = wishlistItems.filter((item) => item !== null);

    res.status(200).json({ wishlistItems: filteredWishlistItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get order lists
router.get("/list-orders", isSignedIn, async (req, res) => {
  try {
    const userId = req.user;
    const { orderStatus, orderDate } = req.query;

    // get orderId from user model
    const orderlist = await OrderModel.find({ user: userId }).sort({
      orderDate: -1,
    });

    if (!orderlist) {
      return res.status(404).json({ message: "No Order History Available" });
    }

    let filteredOrders = [...orderlist];

    if (orderStatus) {
      filteredOrders = filteredOrders.filter(
        (order) => order.deliveryStatus === orderStatus
      );
    }

    if (orderDate) {
      const currentDate = new Date();
      let startDate;

      switch (orderDate) {
        case "last30days":
          startDate = new Date(
            currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          break;
        case "last60days":
          startDate = new Date(
            currentDate.getTime() - 60 * 24 * 60 * 60 * 1000
          );
          break;
        case "last90days":
          startDate = new Date(
            currentDate.getTime() - 90 * 24 * 60 * 60 * 1000
          );
          break;
        case "last1year":
          startDate = new Date(
            currentDate.getTime() - 365 * 24 * 60 * 60 * 1000
          );
          break;
        default:
          break;
      }

      if (startDate) {
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.orderDate >= startDate && order.orderDate <= currentDate
        );
      }
    }

    res.status(200).json({ orderlist: filteredOrders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// send password reset request via mail
router.post("/forgot-password", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      let token = Math.random().toString(36).slice(-8);
      user.resetlink = token;
      user.resetExpiresAt = Date.now() + 360000; //1hr
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const message = {
        from: "nodemailer@gmail.com",
        to: user.email,
        subject: "password reset request",
        text: `To reset your password, Kindly click on the following link reset your password:
             ${fe_url}/reset-password/${token}
         Kindly ignore the mail if you have not requested a password reset.`,
      };

      transporter.sendMail(message, (error, info) => {
        if (error) {
          res
            .status(404)
            .json({ message: "Something went wrong. Please try again." });
        }
        console.log(info.response);
        res
          .status(200)
          .json({ message: "Password reset requested successfully" });
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Set new password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // const data = await decodeToken(token);
    const user = await UserModel.findOne({
      resetlink: token,
      resetExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid Token" });
    }

    // Reset the user's password
    user.password = await hashPassword(password);
    user.resetlink = null;
    user.resetExpiresAt = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// User logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

module.exports = router;
