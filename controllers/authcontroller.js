const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const authModel = require('../models/authmodel');

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, Email, dan Password wajib diisi' });
    }

    const existingUser = await authModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await authModel.createUser(
      name,
      email,
      hashedPassword,
      phone || null,
      address || null
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===================== LOGIN USER =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan Password wajib diisi' });
    }

    const user = await authModel.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    res.status(200).json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        photo: user.photo || '',
        is_admin: user.is_admin || 0,
        last_login: new Date(),
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===================== LOGIN ADMIN =====================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan Password wajib diisi' });
    }

    const user = await authModel.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    if (user.is_admin !== 1) {
      return res.status(403).json({ message: 'Akses ditolak: hanya untuk admin' });
    }

    res.status(200).json({
      message: 'Login admin berhasil',
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: true,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===================== UPDATE PROFILE =====================
exports.updateProfile = async (req, res) => {
  const userId = req.params.id;
  const { name, phone, address, password } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const user = await authModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    let updatedPassword = user.password;
    if (password && password.trim() !== '') {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    // Hapus foto lama jika ada dan unggah foto baru
    if (photo && user.photo && user.photo.startsWith('/uploads/')) {
      const oldPhotoPath = path.join(__dirname, '..', user.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const updatedUser = await authModel.updateUser(userId, {
      name: name || user.name,
      phone: phone || user.phone,
      address: address || user.address,
      password: updatedPassword,
      photo: photo || user.photo,
    });

    res.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: user.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        photo: updatedUser.photo,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui profil' });
  }
};

// ===================== UPLOAD FOTO SAJA =====================
exports.uploadPhoto = async (req, res) => {
  const userId = req.params.id;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file foto yang diunggah' });
    }

    const user = await authModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Hapus foto lama jika ada
    if (user.photo && user.photo.startsWith('/uploads/')) {
      const oldPhotoPath = path.join(__dirname, '..', user.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    const updated = await authModel.updateUser(userId, {
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      password: user.password,
      photo: photoUrl,
    });

    res.json({
      message: 'Foto profil berhasil diperbarui',
      photo: photoUrl,
    });
  } catch (err) {
    console.error('Upload photo error:', err);
    res.status(500).json({ message: 'Gagal mengunggah foto' });
  }
};