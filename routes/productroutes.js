const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller'); // ✅ tambahkan ini!

// GET semua produk
router.get('/', productController.getProducts);

// GET produk berdasarkan ID
router.get('/:id', productController.getProductById);

module.exports = router;
