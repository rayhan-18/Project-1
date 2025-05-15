const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller');

router.get('/:id', productController.getProductDetail);

module.exports = router;
