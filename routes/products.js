var express = require('express');
const { ProductModel } = require('../models/productSchema');
var router = express.Router();


// Get all products
router.get('/list', async (req, res) => {
  try {
    const { sortBy } = req.query;

    let sortCriteria = {};

    switch (sortBy) {
      case 'highToLow':
        sortCriteria = { price: -1 };
        break;
      case 'lowToHigh':
        sortCriteria = { price: 1 };
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

    const products = await ProductModel.find().sort(sortCriteria);
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
    res.status(200).send({ product });
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