// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================
// 🌐 MIDDLEWARE GLOBAL
// ============================

// Izinkan permintaan dari domain berbeda (e.g. frontend dev server)
app.use(cors());

// Middleware untuk parsing JSON dari body
app.use(express.json());

// ============================
// 🗂️ SERVE STATIC FILES
// ============================

// Public folder untuk HTML statis
app.use(express.static(path.join(__dirname, 'publik')));

// Folder untuk file statis seperti gambar, CSS, JS
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ============================
// 🔗 ROUTES
// ============================

// Import semua route
const authRoutes = require('./routes/authroutes');
const cartRoutes = require('./routes/cartroutes');
const wishlistRoutes = require('./routes/wishlistroutes');
const productRoutes = require('./routes/productroutes');
const orderRoutes = require('./routes/orderroutes');
const reportRoutes = require('./routes/reportroutes');
const contactRoutes = require('./routes/contactroutes');

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);     // 💡 Termasuk search/filter/export Excel
app.use('/api/orders', orderRoutes);          // 💡 Termasuk summary dan chart
app.use('/api/export', reportRoutes);         // 💡 Ekspor laporan PDF/Excel
app.use('/api/contact', contactRoutes);

// ============================
// ❌ 404 HANDLER (Fallback)
// ============================

app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

// ============================
// 🚀 START SERVER
// ============================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
