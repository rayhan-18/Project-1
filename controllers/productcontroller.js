const { getProductById, getAllProducts } = require('../models/productmodel');

// Controller: GET /api/products/:id
const getProductByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await getProductById(id);

    console.log('Product result:', product); // Debug

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock = Number(product.stock); // Pastikan stock berupa angka

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

module.exports = {
  getProductById: getProductByIdController,
  getProducts
};
