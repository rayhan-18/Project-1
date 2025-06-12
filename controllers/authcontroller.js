const bcrypt = require('bcrypt');
const authModel = require('../models/authmodel');

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, Email, dan Password harus diisi' });
  }

  try {
    const existingUser = await authModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authModel.createUser(
      name,
      email,
      hashedPassword,
      phone || null,
      address || null
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===================== LOGIN USER =====================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan Password wajib diisi' });
  }

  try {
    const user = await authModel.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        last_login: new Date(),
        is_admin: user.is_admin || 0,
        photo: user.photo || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===================== LOGIN ADMIN =====================
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan Password wajib diisi' });
  }

  try {
    const user = await authModel.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    if (user.is_admin !== 1) {
      return res.status(403).json({ message: 'Akses ditolak: hanya admin' });
    }

    res.json({
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

  try {
    const user = await authModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    let updatedPassword = user.password;
    if (password && password.trim() !== '') {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updated = await authModel.updateUser(userId, {
      name: name || user.name,
      phone: phone || user.phone,
      address: address || user.address,
      password: updatedPassword,
    });

    res.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: updated.id,
        name: updated.name,
        email: user.email,
        phone: updated.phone,
        address: updated.address,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui profil' });
  }
};
