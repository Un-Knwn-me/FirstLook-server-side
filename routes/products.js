var express = require('express');
const { ProductModel } = require('../models/productSchema');
const { UserModel } = require('../models/userSchema');
var router = express.Router();

// Get home products
router.get('/home', async (req, res) => {
  try {
    const { userId } = req.query;

    let user = await UserModel.findOne({ _id: userId });

    if(user){
      
    // get all products by category
    const products = await ProductModel.find({
      $or: [
        {
          publish: true,
          category: 'Pant',
          'varients': {
            $elemMatch: {
              size: user.hipSize,
              stock: { $gt: 0 } 
            }
          }
        },
        {
          publish: true,
          category: 'T-shirts',
          'varients': {
            $elemMatch: {
              size: user.shirtSize,
              stock: { $gt: 0 } 
            }
          }
        },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(products);
  } else {
    const products = await ProductModel.find({ publish: true }).sort({ createdAt: -1 }).limit(24);
    res.status(200).json(products);
  }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
})

// Get all products
router.get('/list', async (req, res) => {
  try {
    const { sortBy } = req.query;

    let sortCriteria = {};

    switch (sortBy) {
      case 'highToLow':
        sortCriteria = { salesPrice: -1 };
        break;
      case 'lowToHigh':
        sortCriteria = { salesPrice: 1 };
        break;
      case 'newestFirst':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldestFirst':
        sortCriteria = { createdAt: 1 };
        break;
      case 'name':
        sortCriteria = { name: 1 };
        break;
      default:
        break;
    }

    const products = await ProductModel.find({ publish: true }).sort(sortCriteria);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// get product by ID
router.get('/:id', async(req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId)
    res.status(200).json( product );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get products by category and subcategory
router.get('/products/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { subCategories } = req.query;

    // Ensure subCategories is an array, even if only one subcategory is selected
    const subCategoryArray = Array.isArray(subCategories) ? subCategories : [subCategories];

    const products = await ProductModel.find({
      category,
      subCategory: { $in: subCategoryArray },
    });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for the selected category and Types.' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;