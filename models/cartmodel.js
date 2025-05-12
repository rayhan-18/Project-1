const db = require('../config/db');

exports.addToCart = async (user_id, product_id, product_name, price, image_url, quantity) => {
  const query = `
    INSERT INTO cart (user_id, product_id, product_name, price, image_url, quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await db.query(query, [user_id, product_id, product_name, price, image_url, quantity]);
};
