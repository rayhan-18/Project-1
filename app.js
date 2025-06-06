const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware global
app.use(cors()); // Enable CORS agar frontend bisa akses API
app.use(express.json()); // Parsing JSON request body

// Static file serving
app.use(express.static(path.join(__dirname, 'publik'))); // Frontend HTML, dll
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // CSS, JS, gambar, dll

// Import semua route
const authRoutes = require('./routes/authroutes');
const cartRoutes = require('./routes/cartroutes');
const wishlistRoutes = require('./routes/wishlistroutes');
const productRoutes = require('./routes/productroutes'); // ✅ produk
const orderRoutes = require('./routes/orderroutes');
const reportRoutes = require('./routes/reportroutes');
const contactRoutes = require('./routes/contactroutes');

// Pasang semua route ke app
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes); // ✅ endpoint produk
app.use('/api/orders', orderRoutes);
app.use('/api/export', reportRoutes);
app.use('/api/contact', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

// Jalankan server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
