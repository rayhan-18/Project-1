// controllers/productController.js

const ExcelJS = require('exceljs');
const db = require('../config/db');
const {
  getProductById,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../models/productmodel');

// ✅ GET /api/products/:id
const getProductByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    let query = `
      SELECT 
        id AS product_id,
        name AS product_name,
        category,
        stock,
        price,
        image_url
      FROM products
      WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND name LIKE ?`;
      params.push(`%${search}%`);
    }
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    const [products] = await db.query(query, params);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Gagal mengambil data produk' });
  }
};

// ✅ POST /api/products
const createProductController = async (req, res) => {
  try {
    const { product_name, category, stock, price, image_url, description } = req.body;
    if (!product_name || !price || !image_url) {
      return res.status(400).json({ message: 'Field wajib diisi' });
    }
    const newProduct = await createProduct({ product_name, category, stock, price, image_url, description });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Gagal menambahkan produk' });
  }
};

// ✅ PUT /api/products/:id
const updateProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const { product_name, category, stock, price, image_url, description } = req.body;
    if (!product_name || !price || !image_url) {
      return res.status(400).json({ message: 'Field wajib diisi' });
    }
    const existingProduct = await getProductById(id);
    if (!existingProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    const updatedProduct = await updateProduct(id, { product_name, category, stock, price, image_url, description });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Gagal memperbarui produk' });
  }
};

// ✅ DELETE /api/products/:id
const deleteProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const existingProduct = await getProductById(id);
    if (!existingProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    await deleteProduct(id);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Gagal menghapus produk' });
  }
};

// ✅ GET /api/products/export
const exportToExcel = async (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    let query = `
      SELECT 
        id AS product_id,
        name AS product_name,
        category,
        stock,
        price,
        image_url
      FROM products
      WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND name LIKE ?`;
      params.push(`%${search}%`);
    }
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    const [products] = await db.query(query, params);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Produk');

    sheet.columns = [
      { header: 'ID', key: 'product_id', width: 10 },
      { header: 'Nama Produk', key: 'product_name', width: 30 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Stok', key: 'stock', width: 10 },
      { header: 'Harga', key: 'price', width: 15 },
      { header: 'URL Gambar', key: 'image_url', width: 40 }
    ];

    products.forEach(p => sheet.addRow(p));
    sheet.getColumn('price').numFmt = '"Rp"#,##0';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=produk_toko_rayhan.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Export Excel error:', err);
    res.status(500).send('Gagal ekspor Excel');
  }
};

module.exports = {
  getProductById: getProductByIdController,
  getProducts,
  createProduct: createProductController,
  updateProduct: updateProductController,
  deleteProduct: deleteProductController,
  exportToExcel
};
