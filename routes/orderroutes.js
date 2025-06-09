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

// Route: Buat order baru
router.post('/', placeOrder);

// Route: Dapatkan semua orders (admin) dengan pagination dan filter status
// Contoh: GET /orders?page=1&limit=10&status=completed
router.get('/', getAllOrders);

// Route: Dapatkan semua orders berdasarkan user_id
router.get('/user/:userId', getOrdersByUser);

// Route: Dapatkan ringkasan pesanan untuk dashboard admin
router.get('/summary', getOrderSummary);

// Route: Dapatkan detail order berdasarkan ID (HARUS ditaruh setelah '/summary' untuk menghindari konflik)
router.get('/:id', getOrderDetail);

// Route: Update status order berdasarkan ID
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
