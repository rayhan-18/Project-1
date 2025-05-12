const express = require('express');
const router = express.Router();
// Periksa apakah ini benar-benar sesuai dengan path ke cartController.js
const cartController = require('../controllers/cartcontroller');  

router.post('/', cartController);  // Pastikan memanggil cartController di sini

module.exports = router;
