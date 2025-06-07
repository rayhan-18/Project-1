const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller');

// GET semua produk
router.get('/', productController.getProducts);

// GET produk berdasarkan ID
router.get('/:id', productController.getProductById);

// POST buat produk baru
router.post('/', productController.createProduct);

// PUT update produk
router.put('/:id', productController.updateProduct);

// DELETE hapus produk
router.delete('/:id', productController.deleteProduct);

module.exports = router;