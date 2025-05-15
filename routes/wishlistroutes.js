const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistcontroller');

router.post('/', wishlistController.addToWishlist);

module.exports = router;
