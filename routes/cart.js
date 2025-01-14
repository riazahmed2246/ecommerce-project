const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
};

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('cart.product');
    res.render('cart/index', { cart: user.cart });
  } catch (error) {
    res.status(500).send('Error fetching cart');
  }
});

router.post('/add/:productId', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const productId = req.params.productId;
    
    const existingItem = user.cart.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ product: productId });
    }

    await user.save();
    res.redirect('/cart');
  } catch (error) {
    res.status(500).send('Error adding to cart');
  }
});

module.exports = router;