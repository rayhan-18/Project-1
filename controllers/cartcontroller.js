const db = require('../config/db');

// Controller untuk tambah produk ke cart
exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, product_name, price, image_url, quantity } = req.body;

    // Cek apakah produk sudah ada di cart user
    const [existing] = await db.query(
      `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`,
      [user_id, product_id]
    );

    if (existing.length > 0) {
      // Produk sudah ada, update quantity
      const newQuantity = existing[0].quantity + quantity;
      await db.query(
        `UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [newQuantity, user_id, product_id]
      );
      res.status(200).json({ message: 'Produk sudah ada di cart, kuantitas diperbarui' });
    } else {
      // Produk belum ada, insert baru
      const [result] = await db.execute(
        `INSERT INTO cart (user_id, product_id, product_name, price, image_url, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, product_id, product_name, price, image_url, quantity]
      );
      res.status(201).json({ message: 'Produk berhasil ditambahkan ke cart', cartId: result.insertId });
    }

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Controller untuk ambil cart berdasarkan user_id
exports.getCartByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await db.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Gagal mengambil data cart' });
  }
};
