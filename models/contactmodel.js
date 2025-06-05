const db = require('../config/db');

const Contact = {
  // Simpan pesan baru dari form kontak
  async save({ name, email, subject, message }) {
    if (!name || !email || !subject || !message) {
      throw new Error('Semua field harus diisi');
    }

    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, subject, message, 'unread'] // status default 'unread'
    );

    return result;
  },

  // Ambil pesan kontak dengan pagination (page mulai dari 1)
  async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // Query untuk ambil data dengan limit & offset
    const [rows] = await db.query(
      'SELECT id, name, email, subject, message, status, created_at FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    // Query untuk menghitung total pesan (untuk pagination)
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM contact_messages'
    );

    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Ambil satu pesan berdasarkan ID
  async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM contact_messages WHERE id = ?',
      [id]
    );
    return rows[0]; // kembalikan satu objek
  },

  // Hapus pesan berdasarkan ID
  async delete(id) {
    const [result] = await db.query(
      'DELETE FROM contact_messages WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0; // true jika berhasil hapus
  },

  // Tandai pesan sebagai sudah dibaca
  async markAsRead(id) {
    const [result] = await db.query(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      ['read', id]
    );
    return result.affectedRows > 0; // true jika berhasil update
  }
};

module.exports = Contact;
