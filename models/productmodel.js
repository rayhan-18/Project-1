const db = require('../config/db');

async function getProductById(id) {
  const [rows] = await db.query(`
    SELECT id AS product_id, name, price, image_url, category, description, stock
    FROM products
    WHERE id = ?
  `, [id]);

  const product = rows[0];
  console.log('Queried product:', product); // <-- penting!

  return product;
}

module.exports = {
  getProductById,
};
