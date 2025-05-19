const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware untuk mengizinkan CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware untuk parsing body request JSON
app.use(express.json());

// Import route modules
const authRoutes = require('./routes/authroutes');
const cartRoutes = require('./routes/cartroutes');
const wishlistRoutes = require('./routes/wishlistroutes');
const productRoutes = require('./routes/productRoutes');

// Gunakan routes dengan prefix masing-masing
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);

// Jalankan server di port yang ditentukan environment variable atau 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
