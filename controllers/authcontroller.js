const bcrypt = require('bcrypt');
const authModel = require('../models/authmodel');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Cek apakah user sudah ada
    const existingUser = await authModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user ke database
    const user = await authModel.createUser(name, email, hashedPassword);

    // Jangan kirim password ke response
    res.status(201).json({
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Login berhasil
    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
