const db = require('../config/db');

// Controller untuk tambah produk ke cart
exports.addToCart = async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      product_name,
      price,
      image_url,
      quantity
    } = req.body;

    console.log("Data diterima untuk addToCart:", req.body);

    // Validasi input wajib
    if (!user_id || !product_id || !product_name || !price || !image_url) {
      return res.status(400).json({ message: 'Semua data produk harus dikirim' });
    }

    // Konversi dan validasi tipe data numerik
    const userId = parseInt(user_id);
    const productId = parseInt(product_id);
    const productPrice = parseFloat(price);
    const qty = quantity ? parseInt(quantity) : 1;

    if (isNaN(userId) || isNaN(productId) || isNaN(productPrice) || isNaN(qty)) {
      return res.status(400).json({ message: 'Data numerik tidak valid' });
    }

    // Cek apakah produk sudah ada di cart user
    const [existing] = await db.query(
      `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    if (existing.length > 0) {
      // Produk sudah ada, update quantity
      const newQuantity = existing[0].quantity + qty;
      await db.query(
        `UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [newQuantity, userId, productId]
      );

      const [updatedCart] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
      return res.status(200).json(updatedCart);
    }

    // Produk belum ada, insert baru
    const [result] = await db.execute(
      `INSERT INTO cart (user_id, product_id, product_name, price, image_url, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, productId, product_name, productPrice, image_url, qty]
    );

    const [updatedCart] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
    res.status(201).json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Controller untuk ambil cart berdasarkan user_id
exports.getCartByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userId = parseInt(user_id);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'ID user tidak valid' });
    }

    const [rows] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Gagal mengambil data cart' });
  }
};

// Controller untuk ambil cart berdasarkan user_id
exports.getCartByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userId = parseInt(user_id);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'ID user tidak valid' });
    }

    const [rows] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Gagal mengambil data cart' });
  }
};
