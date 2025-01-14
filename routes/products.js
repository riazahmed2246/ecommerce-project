const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const products = require('../data');

// Seed initial products
// async function seedProducts() {
//   try {
//     const count = await Product.countDocuments();
//     if (count === 0) {
//       await Product.insertMany(products);
//       console.log('Products seeded successfully');
//     }
//   } catch (error) {
//     console.error('Error seeding products:', error);
//   }
// }

async function seedProducts() {
  try {
    await Product.deleteMany(); // Clear the existing products
    await Product.insertMany(products); // Insert new products
    console.log('Products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

seedProducts();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('products/index', { products, user: req.session.userId });
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
});

module.exports = router;