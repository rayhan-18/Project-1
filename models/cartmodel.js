const db = require('../config/db');

// Menambahkan produk ke cart
exports.addToCart = async (user_id, product_id, product_name, price, image_url, quantity) => {
  const query = `
    INSERT INTO cart (user_id, product_id, product_name, price, image_url, quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await db.query(query, [user_id, product_id, product_name, price, image_url, quantity]);
};

// Mengambil semua produk dalam cart berdasarkan user_id
exports.getCartByUserId = async (user_id) => {
  const [rows] = await db.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);
  return rows;
};
