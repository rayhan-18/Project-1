const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistcontroller');

// POST: Tambah produk ke wishlist
router.post('/', wishlistController.addToWishlist);

// GET: Ambil wishlist by user_id
router.get('/:user_id', wishlistController.getWishlistByUserId);

// DELETE: Hapus produk wishlist berdasarkan user_id dan product_id
router.delete('/:user_id/:product_id', wishlistController.removeFromWishlist);

module.exports = router;
