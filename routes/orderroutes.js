const express = require('express');
const router = express.Router();
const { placeOrder } = require('../controllers/ordercontroller');

// POST /api/orders/
router.post('/', placeOrder);

module.exports = router;
