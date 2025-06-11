const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller');

// ✅ GET semua produk (dengan filter/search)
router.get('/', productController.getProducts);

// ✅ GET export produk ke Excel (dengan filter/search) – HARUS SEBELUM /:id
router.get('/export', productController.exportToExcel);

// ✅ GET produk berdasarkan ID
router.get('/:id', productController.getProductById);

// ✅ POST buat produk baru
router.post('/', productController.createProduct);

// ✅ PUT update produk berdasarkan ID
router.put('/:id', productController.updateProduct);

// ✅ DELETE produk berdasarkan ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
