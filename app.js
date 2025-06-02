const express = require('express');
const cors = require('cors');
const path = require('path'); // untuk mengatur path folder statis

require('dotenv').config();

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Serve HTML dan file statis dari folder publik
app.use(express.static(path.join(__dirname, 'publik')));

// Serve file CSS/JS dari folder assets (bisa folder di luar publik)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Import route files
const authRoutes = require('./routes/authroutes');
const cartRoutes = require('./routes/cartroutes');
const wishlistRoutes = require('./routes/wishlistroutes');
const productRoutes = require('./routes/productroutes');
const orderRoutes = require('./routes/orderroutes'); // pastikan file ini ada dan benar

// Gunakan routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // route orders

// Handle 404 untuk route yang tidak ditemukan (opsional tapi disarankan)
app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

// Jalankan server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
