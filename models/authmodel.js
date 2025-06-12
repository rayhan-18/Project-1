const db = require('../config/db');

// ===================== Ambil user berdasarkan email =====================
exports.getUserByEmail = async (email) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];  // null jika tidak ditemukan
  } catch (err) {
    console.error('getUserByEmail error:', err);
    throw new Error('Gagal mengambil data pengguna');
  }
};

// ===================== Ambil user berdasarkan ID =====================
exports.getUserById = async (id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  } catch (err) {
    console.error('getUserById error:', err);
    throw new Error('Gagal mengambil data pengguna berdasarkan ID');
  }
};

// ===================== Buat user baru =====================
exports.createUser = async (name, email, password, phone, address) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, phone, address, is_admin) 
       VALUES (?, ?, ?, ?, ?, 0)`,
      [name, email, password, phone, address]
    );

    return {
      id: result.insertId,
      name,
      email,
      phone,
      address,
      is_admin: 0,
    };
  } catch (err) {
    console.error('createUser error:', err);
    throw new Error('Gagal membuat pengguna baru');
  }
};

// ===================== Update data user =====================
exports.updateUser = async (id, data) => {
  const { name, phone, address, password } = data;

  try {
    await db.execute(
      `UPDATE users 
       SET name = ?, phone = ?, address = ?, password = ? 
       WHERE id = ?`,
      [name, phone, address, password, id]
    );

    return { id, name, phone, address };
  } catch (err) {
    console.error('updateUser error:', err);
    throw new Error('Gagal memperbarui data pengguna');
  }
};

// ===================== Update foto profil user =====================
exports.updateUserPhoto = async (id, photoUrl) => {
  try {
    await db.execute('UPDATE users SET photo = ? WHERE id = ?', [photoUrl, id]);
    return photoUrl;
  } catch (err) {
    console.error('updateUserPhoto error:', err);
    throw new Error('Gagal memperbarui foto profil');
  }
};
