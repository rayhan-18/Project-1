const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller');

// Gunakan controller yang sudah kamu buat
router.get('/:id', productController.getProductById);

module.exports = router;
