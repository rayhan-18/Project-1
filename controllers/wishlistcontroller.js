const db = require('../config/db');

// Controller untuk tambah produk ke wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      product_name,
      price,
      image_url,
    } = req.body;

    console.log("Data diterima untuk addToWishlist:", req.body);

    // Validasi input wajib
    if (!user_id || !product_id || !product_name || !price || !image_url) {
      return res.status(400).json({ message: 'Semua data produk harus dikirim' });
    }

    // Konversi dan validasi tipe data numerik
    const userId = parseInt(user_id);
    const productId = parseInt(product_id);
    const productPrice = parseFloat(price);

    if (isNaN(userId) || isNaN(productId) || isNaN(productPrice)) {
      return res.status(400).json({ message: 'Data numerik tidak valid' });
    }

    // Cek apakah produk sudah ada di wishlist user
    const [existing] = await db.query(
      `SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    if (existing.length > 0) {
      // Kalau kamu mau biarkan error kalau sudah ada, bisa return 400:
      return res.status(400).json({ message: 'Produk sudah ada di wishlist.' });

      // Atau kalau mau update sesuatu, bisa lakukan update di sini
      // Tapi biasanya wishlist cukup sekali tambah tanpa quantity
    }

    // Produk belum ada, insert baru
    await db.execute(
      `INSERT INTO wishlist (user_id, product_id, product_name, price, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, productId, product_name, productPrice, image_url]
    );

    // Ambil data wishlist terbaru
    const [updatedWishlist] = await db.query('SELECT * FROM wishlist WHERE user_id = ?', [userId]);
    res.status(201).json(updatedWishlist);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Controller untuk ambil wishlist berdasarkan user_id
exports.getWishlistByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userId = parseInt(user_id);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'ID user tidak valid' });
    }

    const [rows] = await db.query('SELECT * FROM wishlist WHERE user_id = ?', [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Gagal mengambil data wishlist' });
  }
};
