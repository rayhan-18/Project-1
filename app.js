const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Static file serving
app.use(express.static(path.join(__dirname, 'publik')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Import route files
const authRoutes = require('./routes/authroutes');
const cartRoutes = require('./routes/cartroutes');
const wishlistRoutes = require('./routes/wishlistroutes');
const productRoutes = require('./routes/productroutes');
const orderRoutes = require('./routes/orderroutes');
const reportRoutes = require('./routes/reportroutes');
const contactRoutes = require('./routes/contactroutes');

// Gunakan routes dengan prefix API yang sesuai
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/export', reportRoutes);
app.use('/api/contact', contactRoutes);

// 404 handler untuk route yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

// Jalankan server di port yang di-set di .env atau default 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
