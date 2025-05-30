const { getProductById } = require('../models/productmodel');

const getProductByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await getProductById(id);

    console.log('Product result:', product); // ⬅️ Tambahkan ini untuk debug

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock = Number(product.stock);

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getProductById: getProductByIdController, // ❗pastikan ini tidak tertukar
};
