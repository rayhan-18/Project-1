const db = require('../config/db');

// Controller untuk tambah produk ke cart
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

    // Cek produk sudah ada
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + qty;
      console.log('Existing quantity:', existing[0].quantity);
      console.log('Quantity to add:', qty);
      console.log('New quantity:', newQuantity);

      await db.query(
        `UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [newQuantity, userId, productId]
      );

      const [updatedCart] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
      return res.status(200).json(updatedCart);
    }
  else {
      // Insert baru
      await db.query(
        `INSERT INTO cart (user_id, product_id, product_name, price, image_url, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, productId, product_name, productPrice, image_url, qty]
      );
    }

    // Kirim cart terbaru
    const [updatedCart] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
    res.status(existing.length > 0 ? 200 : 201).json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Controller ambil cart berdasarkan user_id
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

// Controller hapus 1 item dari cart berdasarkan user_id dan product_id
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

// Controller update quantity produk cart
exports.updateQuantity = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || typeof quantity === 'undefined') {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Ambil quantity sekarang
    const [rows] = await db.query(
      'SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan di cart' });
    }

    let currentQuantity = rows[0].quantity;
    let newQuantity = currentQuantity + quantity;

    if (newQuantity < 1) newQuantity = 1;  // Jangan kurang dari 1, atau bisa juga hapus item jika 0

    await db.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [newQuantity, user_id, product_id]
    );

    const [updatedCart] = await db.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);
    res.status(200).json(updatedCart);

  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ message: 'Gagal update kuantitas' });
  }
};
