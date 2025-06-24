// ============================
// 🌐 ENVIRONMENT SETUP
// ===========================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ============================
// ⚙️ GLOBAL MIDDLEWARE
// ============================

// Aktifkan CORS agar frontend bisa akses API
app.use(cors());

// Middleware parsing JSON dari body request
app.use(express.json());

// ============================
// 🗂️ STATIC FILES
// ============================

// Folder publik untuk HTML dan favicon
app.use(express.static(path.join(__dirname, "publik")));

// Tambahkan ini di bawah baris static publik:
app.use("/publik", express.static(path.join(__dirname, "publik")));

// Folder aset frontend (JS, CSS, Gambar)
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Folder untuk gambar produk
app.use("/product", express.static(path.join(__dirname, "product")));

// ✅ Folder halaman admin
app.use("/admin", express.static(path.join(__dirname, "admin")));

// ============================
// 🔗 API ROUTES (Modular)
// ============================

// Import routes modular
const authRoutes = require("./routes/authroutes"); // 🔐 Login, Register, OTP
const cartRoutes = require("./routes/cartroutes"); // 🛒 Keranjang
const wishlistRoutes = require("./routes/wishlistroutes"); // ❤️ Wishlist
const productRoutes = require("./routes/productroutes"); // 📦 Produk
const orderRoutes = require("./routes/orderroutes"); // 🧾 Pesanan
const reportRoutes = require("./routes/reportroutes"); // 📤 Export data
const contactRoutes = require("./routes/contactroutes"); // 📩 Kontak/pesan

// Daftarkan prefix routes
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/export", reportRoutes);
app.use("/api/contacts", contactRoutes);

// ============================
// ❌ 404 HANDLER
// ============================
app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint tidak ditemukan.",
    path: req.originalUrl,
  });
});

// ============================
// 💥 GLOBAL ERROR HANDLER
// ============================
app.use((err, req, res, next) => {
  console.error("❌ Error Server:", err.stack);
  res.status(500).json({
    message: "Terjadi kesalahan pada server.",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

// ============================
// 🚀 START SERVER
// ============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server aktif di http://localhost:${PORT}`);
});
