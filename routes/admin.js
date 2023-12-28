var express = require('express');
const { ProductModel } = require('../models/productSchema');
const { AdminModel } = require('../models/adminSchema');
const { upload, storage, bucketName } = require('../middlewares/storage');
var router = express.Router();
const { format } = require('util');


// Add product
router.post('/product/add', upload.array('images', 6), async (req, res, next) => {
  try {
    const existingProduct = await ProductModel.findOne({ productName: req.body.productName });

    if (!existingProduct) {
      // Extract image URLs from the files uploaded
      const imageUrls = [];

      // Loop through the uploaded files and upload each to the cloud bucket
      for (const file of req.files) {
        const originalname = file.originalname;
        const blob = storage.bucket(bucketName).file(originalname);

        // Make the uploaded file publicly accessible
        await blob.makePublic();

        // Generate the public URL for the file
        const url = format(`https://storage.cloud.google.com/${bucketName}/${originalname}`);
        await imageUrls.push(url);
      }

      const varientsArray = await JSON.parse(req.body.varients);
console.log(imageUrls)
      const productData = {
        ...req.body,
        varients: varientsArray,
        images: imageUrls,
      };

      // Save the product with image URLs in MongoDB
      const product = await new ProductModel(productData);
      await product.save();

      res.status(200).json({ message: 'Product added successfully', images: imageUrls });
    } else {
      console.log(error);
      res.status(401).json({ message: 'Product already exists' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get all products
router.get('/products/list', async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Manage publishing products
router.put('/products/publish/:id', async(req, res) => {
  try {
    const productId = req.params.id;
    const { publishState } = req.body;

    const updatedProduct = await ProductModel.findById(productId)

    if (updatedProduct){
      updatedProduct.publish = publishState
      await updatedProduct.save();
      console.log(updatedProduct.publish)
    }

    if(publishState === true){
      res.status(201).send({ message: "Product Published" });
    } else {
      res.status(201).send({ message: "Product Un-Published" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
})

// get product by ID
router.get('/product/:id', async(req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId)
    res.status(200).send({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
})

// Update a product by ID
router.put('/product/update/:id', upload.array('updatedImages', 6), async (req, res) => {
  try {
      const productId = req.params.id;

      const product = await ProductModel.findById(productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Extract image URLs from the files uploaded
      const imageUrls = [];
      // Loop through the uploaded files and upload each to the cloud bucket
      for (const file of req.files) {
        const originalname = file.originalname;
        const blob = storage.bucket(bucketName).file(originalname);
        // Make the uploaded file publicly accessible
        await blob.makePublic();
        // Generate the public URL for the file
        const url = format(`https://storage.cloud.google.com/${bucketName}/${originalname}`);
        imageUrls.push(url);
      }
      // Push the new image URLs to the existing images array
      product.images = product.images.concat(imageUrls);

       // Remove images specified in the 'removedImages' array
    if (Array.isArray(req.body.removedImages) && req.body.removedImages.length > 0) {

      // Delete the associated image files in Google Cloud Storage
    for (const imageName of req.body.removedImages) {
      const fileName = imageName.split('/').pop(); // Extract file name from URL

      const [versions] = await storage.bucket(bucketName).file(fileName).getMetadata();

      // Fetch the generation number of the file you want to delete (Replace with the actual generation number)
      const generationMatchPrecondition = versions.generation;

      // Set the precondition for the delete operation
      const deleteOptions = {
        ifGenerationMatch: generationMatchPrecondition,
      };

      // Attempt to delete the file
      try {
        await storage.bucket(bucketName).file(fileName).delete(deleteOptions);
        console.log(`gs://${bucketName}/${fileName} deleted`);
      } catch (error) {
        console.error(`Error deleting file ${fileName}:`, error);
        // Handle any error that occurs during deletion
      }
    }
      product.images = product.images.filter(url => !req.body.removedImages.includes(url));
    }

      product.productName = req.body.productName || product.productName;
      product.brandName = req.body.brandName || product.brandName;
      product.sku = req.body.sku || product.sku;
      product.category = req.body.category || product.category;
      product.productType = req.body.productType || product.productType;
      product.size = req.body.size || product.size;
      product.color = req.body.color || product.color;
      product.price = req.body.price || product.price;
      product.salesPrice = req.body.salesPrice || product.salesPrice;
      product.tag = req.body.tag || product.tag;
      product.stock = req.body.stock || product.stock;
      product.fabric = req.body.fabric || product.fabric;
      product.style = req.body.style || product.style;
      product.description = req.body.description || product.description;
      product.notes = req.body.notes || product.notes;
      product.updatedAt = Date.now();

      await product.save();

      res.status(202).json({ message: 'Update is Done' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update the product', error });
  }
});

// delete product by id
router.delete('/product/:deleteId', async (req, res) => {
  try {
    const productId = req.params.deleteId;

    // Find the product in the database to get the associated image file name(s)
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the associated image files in Google Cloud Storage
    for (const imageName of product.images) {
      const fileName = imageName.split('/').pop(); // Extract file name from URL

      const [versions] = await storage.bucket(bucketName).file(fileName).getMetadata();

      // Fetch the generation number of the file you want to delete (Replace with the actual generation number)
      const generationMatchPrecondition = versions.generation;

      // Set the precondition for the delete operation
      const deleteOptions = {
        ifGenerationMatch: generationMatchPrecondition,
      };

      // Attempt to delete the file
      try {
        await storage.bucket(bucketName).file(fileName).delete(deleteOptions);
      } catch (error) {
        console.error(`Error deleting file ${fileName}:`, error);
        // Handle any error that occurs during deletion
      }
    }

    // Delete the product from the database
    await ProductModel.findByIdAndDelete(productId);

    res.status(200).json({ message: 'Product and associated image files deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// signup user
router.post("/signup", async (req, res)=>{
  try {
    let user = await AdminModel.findOne({email: req.body.email})

    if(!user){
      req.body.password = await hashPassword(req.body.password);
      let data = new UserModel(req.body);
      await data.save();
      res.status(200).json({message: "User signed up successfully"});
    } else {
      res.status(401).json({message: "User already exists"});
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// signin user
router.post('/signin', async (req, res) => {
  try {
    const { login, password } = req.body;
    let user = await UserModel.findOne({
      $or: [{ email: login }, { phone: login }],
    });
    
      if(user){
          if(await hashCompare(password, user.password)){
              let token = createToken({ email: user.email, firstName: user.firstName, lastName: user.lastName, shirtSize: user.shirtSize, hipSize: user.hipSize })

              res.status(200).send({message: "User successfully logged in", token });
          } else {
              res.status(401).send({message: "Invalid credentials"})
          }
      } else {
          res.status(404).send({message: "User not found"})
      }           
      console.log(user) 
      } catch (error) {
        console.log(error);
      res.status(500).json({ message: "Internal Server Error", error });      
      }
});

// send password reset request via mail
router.post('/forgot-password', async (req, res)=>{
  try {
    let user = await UserModel.findOne({email: req.body.email})
      if(user){
        let token = Math.random().toString(36).slice(-8);
        user.resetlink = token;
        user.resetExpiresAt = Date.now() + 360000 //1hr
        await user.save()

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
      });
 
      const message = {
        from: 'nodemailer@gmail.com',
        to: user.email,
        subject: "password reset request",
        text: `To reset your password, Kindly click on the following link reset your password:
             ${fe_url}/reset-password/${token}
         Kindly ignore the mail if you have not requested a password reset.`
    }

    transporter.sendMail(message, (error, info)=>{
      if(error){
        res.status(404).json({message: "Something went wrong. Please try again."})
      }
      console.log(info.response)
      res.status(200).json({message: "Password reset requested successfully"})
    })

      } else {
          res.status(404).send({message: "User not found"})
      }  
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
})

// Set new password
router.post('/reset-password/:token', async (req, res) => {
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
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});


module.exports = router;