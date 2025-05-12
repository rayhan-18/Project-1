const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
  
// Pastikan ini mengarah ke file yang benar
const authRoutes = require('./routes/authroutes');
const cartRoutes = require('./routes/cartroutes');  
const productRoutes = require('./routes/productroutes');

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);  // Cart route
app.use('/api/products', productRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
