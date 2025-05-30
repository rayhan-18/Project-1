const express = require('express');
const router = express.Router();
const { getProductById } = require('../controllers/productcontroller');

router.get('/:id', getProductById);

module.exports = router;
