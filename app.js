const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================
// ✅ MIDDLEWARE GLOBAL
// ============================

// Aktifkan CORS agar frontend bisa akses backend meskipun beda origin (misal port 5500 ↔ 3000)
app.use(cors());

// Parsing body JSON (wajib untuk POST, PUT, PATCH)
app.use(express.json());

// ============================
// ✅ STATIC FILES
// ============================

// Folder frontend publik (HTML, CSS, JS static)
app.use(express.static(path.join(__dirname, 'publik')));

// Folder untuk file asset (gambar, CSS, JS)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ============================
// ✅ IMPORT DAN PASANG ROUTES
// ============================

const authRoutes = require('./routes/authroutes');
const cartRoutes = require('./routes/cartroutes');
const wishlistRoutes = require('./routes/wishlistroutes');
const productRoutes = require('./routes/productroutes');
const orderRoutes = require('./routes/orderroutes');
const reportRoutes = require('./routes/reportroutes');
const contactRoutes = require('./routes/contactroutes');

// Semua endpoint API
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/export', reportRoutes);
app.use('/api/contact', contactRoutes);

// ============================
// ✅ 404 HANDLER (jika route tidak ditemukan)
// ============================
app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

// ============================
// ✅ JALANKAN SERVER
// ============================

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
