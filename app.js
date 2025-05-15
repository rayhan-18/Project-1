const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware untuk mengizinkan CORS
app.use(cors());

// Middleware untuk parsing body request JSON
app.use(express.json());

// Menyusun rute-rute untuk autentikasi, keranjang, dan produk
const authRoutes = require('./routes/authroutes');
const cartRoutes = require('./routes/cartroutes');
const productRoutes = require('./routes/productroutes');
const wishlistRoutes = require('./routes/wishlistroutes');

// Menyusun rute API dengan path dasar yang sesuai
app.use('/api/auth', authRoutes);        // Untuk autentikasi (login, register)
app.use('/api/cart', cartRoutes);        // Untuk keranjang belanja
app.use('/api/products', productRoutes); // Untuk produk (lihat produk, filter, dsb.)
app.use('/api/wishlist', wishlistRoutes);

// Menentukan port dan menjalankan server
const port = process.env.PORT || 3000; // Menggunakan port dari environment, jika tidak ada default ke 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
