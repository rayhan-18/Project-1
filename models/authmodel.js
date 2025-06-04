const db = require('../config/db');

exports.getUserByEmail = async (email) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];  // Jika tidak ada user, hasilnya undefined
  } catch (err) {
    console.error(err);
    throw new Error('Gagal mengambil data pengguna');
  }
};

exports.createUser = async (name, email, password, phone, address) => {
  try {
    // Saat buat user baru, is_admin otomatis 0 (bukan admin)
    const [result] = await db.execute(
      `INSERT INTO users 
       (name, email, password, phone, address, is_admin) 
       VALUES (?, ?, ?, ?, ?, 0)`,
      [name, email, password, phone, address]
    );

    // Ambil data lengkap user yang baru dibuat (optional, bisa query ulang)
    return {
      id: result.insertId,
      name,
      email,
      phone,
      address,
      is_admin: 0,
    };
  } catch (err) {
    console.error(err);
    throw new Error('Gagal membuat pengguna baru');
  }
};
