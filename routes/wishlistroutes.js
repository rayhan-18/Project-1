const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistcontroller');

// POST: Tambah produk ke wishlist
router.post('/', wishlistController.addToWishlist);

// GET: Ambil semua wishlist berdasarkan user_id
router.get('/:user_id', wishlistController.getWishlistByUserId);

module.exports = router;
