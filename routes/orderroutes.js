const express = require('express');
const router = express.Router();
const { placeOrder, updateOrderStatus, getOrderDetail, getAllOrders } = require('../controllers/ordercontroller');

// Route untuk membuat order
router.post('/', placeOrder);

// Route untuk get semua orders (letakkan di atas /:id agar tidak tertangkap)
router.get('/', getAllOrders);

// Route untuk get detail order by ID
router.get('/:id', getOrderDetail);

// Route untuk update status order
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
