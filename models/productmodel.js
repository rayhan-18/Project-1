const db = require('../config/db');

// ✅ Ambil semua produk dengan field yang terstruktur
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

// ✅ Ambil satu produk berdasarkan ID
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

// ✅ Tambah produk baru
async function createProduct({ product_name, price, image_url, stock, category = '', description = '' }) {
  const [result] = await db.query(`
    INSERT INTO products (name, price, image_url, category, description, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [product_name, price, image_url, category, description, stock]);

  return {
    product_id: result.insertId,
    product_name,
    price,
    image_url,
    stock,
    category,
    description
  };
}

// ✅ Update produk berdasarkan ID
async function updateProduct(id, { product_name, price, image_url, stock, category = '', description = '' }) {
  await db.query(`
    UPDATE products SET
      name = ?,
      price = ?,
      image_url = ?,
      category = ?,
      description = ?,
      stock = ?
    WHERE id = ?
  `, [product_name, price, image_url, category, description, stock, id]);

  return {
    product_id: id,
    product_name,
    price,
    image_url,
    stock,
    category,
    description
  };
}

// ✅ Hapus produk berdasarkan ID
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
