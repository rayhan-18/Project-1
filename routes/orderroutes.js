const express = require('express');
const router = express.Router();
const {
  placeOrder,
  updateOrderStatus,
  getOrderDetail,
  getAllOrders,
  getOrdersByUser
} = require('../controllers/ordercontroller');

// Route untuk membuat order baru
router.post('/', placeOrder);

// Route untuk mendapatkan semua orders
router.get('/', getAllOrders);

// Route untuk mendapatkan semua orders berdasarkan user_id
router.get('/user/:userId', getOrdersByUser);

// Route untuk mendapatkan detail order berdasarkan ID order
router.get('/:id', getOrderDetail);

// Route untuk mengupdate status order berdasarkan ID order
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
