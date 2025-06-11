const db = require('../config/db');

const Contact = {
  // ✅ Simpan pesan kontak baru
  async save({ name, email, subject, message }) {
    if (!name || !email || !subject || !message) {
      throw new Error('Semua field harus diisi');
    }

    const [result] = await db.query(
      `
      INSERT INTO contact_messages (name, email, subject, message, status)
      VALUES (?, ?, ?, ?, 'unread')
      `,
      [name, email, subject, message]
    );

    return result.insertId;
  },

  // ✅ Ambil daftar pesan dengan filter, pencarian, dan pagination
  async getFilteredContacts({ page = 1, limit = 10, search = '', start = '', end = '' }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];

    if (search) {
      const keyword = `%${search}%`;
      conditions.push(`(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)`);
      values.push(keyword, keyword, keyword, keyword);
    }

    if (start) {
      conditions.push('DATE(created_at) >= ?');
      values.push(start);
    }

    if (end) {
      conditions.push('DATE(created_at) <= ?');
      values.push(end);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const dataQuery = `
      SELECT id, name, email, subject, message, status, created_at
      FROM contact_messages
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM contact_messages
      ${whereClause}
    `;

    const [rows] = await db.query(dataQuery, [...values, parseInt(limit), parseInt(offset)]);
    const [[{ total }]] = await db.query(countQuery, values);

    const contacts = rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status,
      created_at: row.created_at,
      read: row.status === 'read'
    }));

    return {
      contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  // ✅ Ambil satu pesan berdasarkan ID
  async getById(id) {
    const [rows] = await db.query(
      `SELECT * FROM contact_messages WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  // ✅ Hapus pesan berdasarkan ID
  async delete(id) {
    const [result] = await db.query(
      `DELETE FROM contact_messages WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  // ✅ Tandai pesan sebagai dibaca
  async markAsRead(id) {
    const [result] = await db.query(
      `UPDATE contact_messages SET status = 'read' WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Contact;
