const db = require('../config/db');

const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(
      'SELECT id AS product_id, name, price, image_url, category, description FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getProductById,
};
