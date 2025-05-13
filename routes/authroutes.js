const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// Route untuk registrasi user
router.post('/register', authController.register);

// Route untuk login user
router.post('/login', authController.login);

module.exports = router;
