const express = require('express');
const router = express.Router();
const db = require('../config/db'); // atau lokasi koneksi Anda

// Pastikan controller berfungsi dengan benar
router.post('/', async (req, res) => {
  try {
    const { user_id, product_id, product_name, price, image_url, quantity } = req.body;
    const [result] = await db.execute(
      `INSERT INTO cart (user_id, product_id, product_name, price, image_url, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, product_id, product_name, price, image_url, quantity]
    );
    res.status(201).json({ message: 'Product added to cart', cartId: result.insertId });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pastikan router diekspor
module.exports = router;
