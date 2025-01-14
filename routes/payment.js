const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
};

router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('cart.product');
    
    const lineItems = user.cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/payment/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: 'Error creating checkout session' });
  }
});

router.get('/success', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    user.cart = [];
    await user.save();
    res.render('payment/success');
  } catch (error) {
    res.status(500).send('Error processing payment');
  }
});

module.exports = router;