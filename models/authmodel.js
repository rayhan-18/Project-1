const db = require('../config/db');

exports.getUserByEmail = async (email) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];  // Jika tidak ada user, hasilnya akan undefined
  } catch (err) {
    console.error(err);
    throw new Error('Gagal mengambil data pengguna');
  }
};

exports.createUser = async (name, email, password, phone, address) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)', 
      [name, email, password, phone, address]
    );
    return { id: result.insertId, name, email, phone, address }; // Mengembalikan user yang baru dibuat
  } catch (err) {
    console.error(err);
    throw new Error('Gagal membuat pengguna baru');
  }
};
