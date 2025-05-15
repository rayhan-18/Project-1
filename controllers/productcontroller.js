const productModel = require('../models/productmodel');

const getProductDetail = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await productModel.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error getProductDetail:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { getProductDetail };
