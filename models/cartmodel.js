const cartModel = require('../models/cartmodel');

// Controller untuk tambah produk ke cart
exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, product_name, price, image_url, quantity } = req.body;

    if (!user_id || !product_id || !product_name || !price || !image_url) {
      return res.status(400).json({ message: 'Semua data produk harus dikirim' });
    }

    const userId = parseInt(user_id);
    const productId = parseInt(product_id);
    const productPrice = parseFloat(price);
    const qty = quantity ? parseInt(quantity) : 1;

    if (isNaN(userId) || isNaN(productId) || isNaN(productPrice) || isNaN(qty)) {
      return res.status(400).json({ message: 'Data numerik tidak valid' });
    }

    // Cek apakah produk sudah ada di cart
    const existingCart = await cartModel.getCartByUserId(userId);
    const existingProduct = existingCart.find(item => item.product_id === productId);

    if (existingProduct) {
      // Update quantity jika sudah ada
      const newQuantity = existingProduct.quantity + qty;
      await cartModel.updateQuantity(userId, productId, newQuantity);
    } else {
      // Tambah produk baru ke cart
      await cartModel.addToCart(userId, productId, product_name, productPrice, image_url, qty);
    }

    const updatedCart = await cartModel.getCartByUserId(userId);
    res.status(200).json(updatedCart);

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Controller ambil cart berdasarkan user_id
exports.getCartByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'ID user tidak valid' });
    }
    const cart = await cartModel.getCartByUserId(userId);
    res.status(200).json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Gagal mengambil data cart' });
  }
};

// Controller update quantity produk cart
exports.updateQuantity = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    if (!user_id || !product_id || typeof quantity === 'undefined') {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }
    await cartModel.updateQuantity(user_id, product_id, quantity);
    const updatedCart = await cartModel.getCartByUserId(user_id);
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ message: 'Gagal update kuantitas' });
  }
};
