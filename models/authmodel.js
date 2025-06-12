const db = require('../config/db');

// ===================== Ambil user berdasarkan email =====================
exports.getUserByEmail = async (email) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  } catch (err) {
    console.error('getUserByEmail error:', err);
    throw new Error('Gagal mengambil data pengguna');
  }
};

// ===================== Ambil user berdasarkan ID =====================
exports.getUserById = async (id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
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
      [name, email, password, phone ?? null, address ?? null]
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

// ===================== Update data user (umum + foto profil) =====================
exports.updateUser = async (id, data) => {
  try {
    // Ambil data user lama untuk fallback
    const [oldData] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (oldData.length === 0) throw new Error('Pengguna tidak ditemukan');

    const user = oldData[0];

    // Gunakan data lama jika data baru tidak ada
    const name = data.name ?? user.name;
    const phone = data.phone ?? user.phone;
    const address = data.address ?? user.address;
    const password = data.password ?? user.password;
    const photo = data.photo ?? user.photo;

    await db.execute(
      `UPDATE users 
       SET name = ?, phone = ?, address = ?, password = ?, photo = ?
       WHERE id = ?`,
      [name, phone, address, password, photo, id]
    );

    return { id, name, phone, address, photo };
  } catch (err) {
    console.error('updateUser error:', err);
    throw new Error('Gagal memperbarui data pengguna');
  }
};
