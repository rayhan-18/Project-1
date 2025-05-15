const db = require('../config/db');

exports.getProductById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0]; // return satu produk saja
};

