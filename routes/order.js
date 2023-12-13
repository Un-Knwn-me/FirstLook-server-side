var express = require('express');
const { isSignedIn } = require('../middlewares/adminAuth');
var router = express.Router();

// Create order
router.post("/orders", isSignedIn, async(req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", error });  
    }
})

module.exports = router;