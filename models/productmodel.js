const db = require('../config/db');

async function getProductById(id) {
  const [rows] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);
  return rows[0];
}

module.exports = {
  getProductById,
};
