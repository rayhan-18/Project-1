const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM products');
  return rows;
};
