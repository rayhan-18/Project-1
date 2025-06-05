const express = require('express');
const router = express.Router();
const {
  placeOrder,
  updateOrderStatus,
  getOrderDetail,
  getAllOrders,
  getOrdersByUser,
  getOrderSummary
} = require('../controllers/ordercontroller');

// Route untuk membuat order baru
router.post('/', placeOrder);

// Route untuk mendapatkan semua orders (admin) dengan pagination dan filter status
// Contoh: GET /orders?page=1&limit=10&status=completed
router.get('/', getAllOrders);

// Route untuk mendapatkan semua orders berdasarkan user_id
router.get('/user/:userId', getOrdersByUser);

// Route baru untuk mendapatkan ringkasan pesanan
router.get('/summary', getOrderSummary);

// Route untuk mendapatkan detail order berdasarkan ID order
router.get('/:id', getOrderDetail);

// Route untuk mengupdate status order berdasarkan ID order
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
