const db = require('../config/db');

// Ambil semua item cart untuk user tertentu
exports.getCartByUserId = async (userId) => {
  const [rows] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
  return rows;
};

// Tambah produk ke cart (dipakai jika belum ada di cart)
exports.addToCart = async (userId, productId, productName, price, imageUrl, quantity) => {
  await db.query(
    `INSERT INTO cart (user_id, product_id, product_name, price, image_url, quantity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, productId, productName, price, imageUrl, quantity]
  );
};

// Update kuantitas produk di cart (atau hapus jika quantity < 1)
exports.updateQuantity = async (userId, productId, newQuantity) => {
  if (newQuantity < 1) {
    // Jika kuantitas kurang dari 1, hapus dari cart
    await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
  } else {
    await db.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [newQuantity, userId, productId]
    );
  }
};

// Hapus satu item dari cart
exports.removeItem = async (userId, productId) => {
  await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
};

// Hapus seluruh cart untuk user tertentu (dipanggil saat checkout)
exports.clearCartByUserId = async (userId) => {
  await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
};

// (Opsional) Cek apakah produk sudah ada di cart (dipakai oleh controller kalau dibutuhkan)
exports.getCartItem = async (userId, productId) => {
  const [rows] = await db.query(
    'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
  return rows.length > 0 ? rows[0] : null;
};
