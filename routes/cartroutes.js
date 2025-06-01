const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartcontroller');

router.post('/', cartController.addToCart);
router.get('/:user_id', cartController.getCartByUserId);
router.delete('/:user_id/:product_id', cartController.removeFromCart);
router.put('/updateQuantity', cartController.updateQuantity);

module.exports = router;
