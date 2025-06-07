const db = require('../config/db');

// Get all products
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

// Get product by ID
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
  return rows[0];
}

// Create new product
async function createProduct(productData) {
  const { product_name, price, image_url, stock, category, description } = productData;
  const [result] = await db.query(`
    INSERT INTO products 
    (name, price, image_url, category, description, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [product_name, price, image_url, category || '', description || '', stock]);
  return { product_id: result.insertId, ...productData };
}

// Update product
async function updateProduct(id, productData) {
  const { product_name, price, image_url, stock, category, description } = productData;
  await db.query(`
    UPDATE products SET
      name = ?,
      price = ?,
      image_url = ?,
      category = ?,
      description = ?,
      stock = ?
    WHERE id = ?
  `, [product_name, price, image_url, category || '', description || '', stock, id]);
  return { product_id: id, ...productData };
}

// Delete product
async function deleteProduct(id) {
  await db.query('DELETE FROM products WHERE id = ?', [id]);
  return true;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
