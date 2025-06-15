// routes/orderRoutes.js (versi refaktor siap pakai dengan route cancel dan cancelled_by)
const express = require('express');
const router = express.Router();
const {
  placeOrder,
  updateOrderStatus,
  getOrderDetail,
  getAllOrders,
  getOrdersByUser,
  getOrderSummary,
  exportOrdersToCSV
} = require('../controllers/ordercontroller');
const db = require('../config/db');

// Buat order baru
router.post('/', placeOrder);

// Ambil semua orders (admin) + filter & pagination
router.get('/', getAllOrders);

// Ambil semua orders berdasarkan user
router.get('/user/:userId', getOrdersByUser);

// Ringkasan pesanan untuk dashboard admin
router.get('/summary', getOrderSummary);

// Ekspor semua pesanan ke CSV
router.get('/export', exportOrdersToCSV);

// Batalkan order (user)
router.put('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [check] = await db.query('SELECT status FROM orders WHERE id = ?', [id]);
    if (!check.length) return res.status(404).json({ message: 'Order tidak ditemukan' });
    if (check[0].status === 'cancelled') return res.status(400).json({ message: 'Pesanan sudah dibatalkan' });

    await db.query('UPDATE orders SET status = ?, cancelled_by = ? WHERE id = ?', ['cancelled', 'user', id]);
    res.json({ message: 'Pesanan berhasil dibatalkan oleh user' });
  } catch (err) {
    console.error('Error di cancel route:', err);
    res.status(500).json({ message: 'Gagal membatalkan pesanan', error: err.message });
  }
});

// Detail order (diletakkan di bawah untuk hindari bentrok dengan '/summary')
router.get('/:id', getOrderDetail);

// Update status order (admin)
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
