const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// ==============================
// 🔐 Autentikasi & User Routes
// ==============================

// 📌 Registrasi user biasa
router.post('/register', authController.register);

// 📌 Login user biasa
router.post('/login', authController.login);

// 📌 Login khusus admin
router.post('/admin/login', authController.adminLogin);

// 📌 Update profil user
router.put('/users/:id', authController.updateProfile);

// (Opsional) 📸 Upload foto profil user
// router.post('/users/:id/photo', upload.single('photo'), authController.uploadPhoto);

module.exports = router;
