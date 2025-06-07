const { 
  getProductById, 
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct 
} = require('../models/productmodel');

// GET /api/products/:id
const getProductByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// POST /api/products
const createProductController = async (req, res) => {
  try {
    const productData = req.body;
    if (!productData.product_name || !productData.price || !productData.image_url) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newProduct = await createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// PUT /api/products/:id
const updateProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const productData = req.body;
    
    if (!productData.product_name || !productData.price || !productData.image_url) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await updateProduct(id, productData);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id
const deleteProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const existingProduct = await getProductById(id);
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await deleteProduct(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

module.exports = {
  getProductById: getProductByIdController,
  getProducts,
  createProduct: createProductController,
  updateProduct: updateProductController,
  deleteProduct: deleteProductController
};