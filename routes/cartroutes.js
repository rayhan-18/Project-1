const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartcontroller');

// Tambah produk ke cart
router.post('/', cartController.addToCart);

// Ambil seluruh cart user
router.get('/:user_id', cartController.getCartByUserId);

// Hapus satu item dari cart user
router.delete('/:user_id/:product_id', cartController.removeFromCart);

// Update quantity produk di cart
router.put('/updateQuantity', cartController.updateQuantity);

// Hapus seluruh cart user (checkout)
router.delete('/clear/:user_id', cartController.clearCartByUserId);

module.exports = router;
