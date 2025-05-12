const db = require('../config/db');

exports.getUserByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

exports.createUser = async (name, email, password) => {
  const [result] = await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
  return { id: result.insertId, name, email };
};
