const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartcontroller');

// Route POST tambah ke cart
router.post('/', cartController.addToCart);

// Route GET ambil cart berdasarkan user_id
router.get('/:user_id', cartController.getCartByUserId);

module.exports = router;
