const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// Route untuk registrasi user biasa
router.post('/register', authController.register);

// Route untuk login user biasa
router.post('/login', authController.login);

// Route khusus untuk login admin saja
router.post('/admin/login', authController.adminLogin);

module.exports = router;
