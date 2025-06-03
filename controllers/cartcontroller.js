const db = require('../config/db');

// Tambah produk ke cart
exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, product_name, price, image_url, quantity } = req.body;

    if (!user_id || !product_id || !product_name || !price || !image_url) {
      return res.status(400).json({ message: 'Semua data produk harus dikirim' });
    }

    const userId = parseInt(user_id);
    const productId = parseInt(product_id);
    const productPrice = parseFloat(price);
    const qty = quantity ? parseInt(quantity) : 1;

    if (isNaN(userId) || isNaN(productId) || isNaN(productPrice) || isNaN(qty)) {
      return res.status(400).json({ message: 'Data numerik tidak valid' });
    }

    // Cek stok produk di database
    const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    const stock = productRows[0].stock;
    if (stock < qty) {
      return res.status(400).json({ message: 'Stok produk tidak mencukupi' });
    }

    // Cek apakah produk sudah ada di cart
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + qty;
      if (newQuantity > stock) {
        return res.status(400).json({ message: 'Jumlah melebihi stok tersedia' });
      }

      await db.query(
        `UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [newQuantity, userId, productId]
      );
    } else {
      await db.query(
        `INSERT INTO cart (user_id, product_id, product_name, price, image_url, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, productId, product_name, productPrice, image_url, qty]
      );
    }

    const [updatedCart] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Ambil cart berdasarkan user_id
exports.getCartByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
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

// Hapus satu item dari cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
    const productId = parseInt(req.params.product_id);

    if (isNaN(userId) || isNaN(productId)) {
      return res.status(400).json({ message: 'ID tidak valid' });
    }

    const [result] = await db.query(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan di cart' });
    }

    res.status(200).json({ message: 'Item berhasil dihapus dari cart' });
  } catch (error) {
    console.error('Hapus item cart error:', error);
    res.status(500).json({ message: 'Gagal menghapus item dari cart' });
  }
};

// Update quantity produk di cart
exports.updateQuantity = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || typeof quantity === 'undefined') {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const userId = parseInt(user_id);
    const productId = parseInt(product_id);
    const change = parseInt(quantity);

    const [rows] = await db.query(
      'SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan di cart' });
    }

    const currentQuantity = rows[0].quantity;
    let newQuantity = currentQuantity + change;

    if (newQuantity <= 0) {
      // Hapus item jika quantity <= 0
      await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
    } else {
      await db.query(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [newQuantity, userId, productId]
      );
    }

    const [updatedCart] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ message: 'Gagal update kuantitas' });
  }
};

// Hapus seluruh cart berdasarkan user_id (untuk checkout)
exports.clearCartByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'ID user tidak valid' });
    }

    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    res.status(200).json({ message: 'Cart berhasil dikosongkan' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Gagal mengosongkan cart' });
  }
};
