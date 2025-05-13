// controllers/authcontroller.js
const bcrypt = require('bcrypt');
const authModel = require('../models/authmodel');

exports.register = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password || !phone || !address) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  try {
    const existingUser = await authModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authModel.createUser(name, email, hashedPassword, phone, address);

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
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
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

    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
