const db = require('../config/db');

// Ambil semua produk
async function getAllProducts() {
  const [rows] = await db.query(`
    SELECT 
      id AS product_id, 
      name AS product_name, 
      price, 
      image_url, 
      category, 
      description, 
      stock
    FROM products
    ORDER BY id ASC
  `);
  return rows;
}

// Ambil produk berdasarkan ID
async function getProductById(id) {
  const [rows] = await db.query(`
    SELECT 
      id AS product_id, 
      name AS product_name, 
      price, 
      image_url, 
      category, 
      description, 
      stock
    FROM products
    WHERE id = ?
  `, [id]);

  const product = rows[0];
  console.log('Queried product:', product);

  return product;
}

module.exports = {
  getAllProducts,
  getProductById
};
