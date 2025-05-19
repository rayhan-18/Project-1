const db = require('../config/db');

// POST - Tambahkan ke wishlist
exports.addToWishlist = async (req, res) => {
  const { user_id, product_id, product_name, price, image_url } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Produk sudah ada di wishlist.' });
    }

    await db.query(
      'INSERT INTO wishlist (user_id, product_id, product_name, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [user_id, product_id, product_name, price, image_url]
    );

    res.status(201).json({ message: 'Berhasil ditambahkan ke wishlist.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan ke wishlist.' });
  }
};

// GET - Ambil semua wishlist berdasarkan user_id
exports.getWishlistByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM wishlist WHERE user_id = ?', [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Gagal ambil wishlist:', error);
    res.status(500).json({ message: 'Gagal mengambil data wishlist.' });
  }
};
