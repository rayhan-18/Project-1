const db = require('../config/db');

// Buat order baru
async function createOrder(orderData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
      (user_id, customer_name, customer_phone, customer_address, shipping_method, shipping_cost, payment_method, subtotal, tax, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderData.user_id,
        orderData.customer_name,
        orderData.customer_phone,
        orderData.customer_address,
        orderData.shipping_method,
        orderData.shipping_cost,
        orderData.payment_method,
        orderData.subtotal,
        orderData.tax,
        orderData.total,
        'pending'
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of orderData.items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.quantity, item.price]
      );
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Update status order by ID
async function updateOrderStatusById(orderId, newStatus) {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [newStatus, orderId]
    );
    return result.affectedRows;
  } finally {
    connection.release();
  }
}

// Get order detail + items by ID
async function getOrderById(orderId) {
  const connection = await db.getConnection();
  try {
    const [orders] = await connection.query(
      `SELECT * FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return null;
    }

    const order = orders[0];

    const [items] = await connection.query(
      `SELECT product_id, product_name, quantity, price FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    return { ...order, items };
  } finally {
    connection.release();
  }
}

// Get semua orders dengan pagination dan filter status
async function getAllOrders(limit = 10, offset = 0, status = null) {
  const connection = await db.getConnection();
  try {
    let query = `SELECT * FROM orders`;
    const values = [];

    if (status) {
      query += ` WHERE status = ?`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const [orders] = await connection.query(query, values);
    return orders;
  } finally {
    connection.release();
  }
}

// Hitung total orders (untuk pagination)
async function countAllOrders(status = null) {
  const connection = await db.getConnection();
  try {
    let query = `SELECT COUNT(*) AS total FROM orders`;
    const values = [];

    if (status) {
      query += ` WHERE status = ?`;
      values.push(status);
    }

    const [rows] = await connection.query(query, values);
    return rows[0].total;
  } finally {
    connection.release();
  }
}

// Get orders by user ID
async function getOrdersByUserId(userId) {
  const connection = await db.getConnection();
  try {
    const [orders] = await connection.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return orders;
  } finally {
    connection.release();
  }
}

// Hitung total order hari ini
async function getTotalOrdersToday() {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS total_today FROM orders WHERE DATE(created_at) = CURDATE()`
    );
    return rows[0].total_today || 0;
  } finally {
    connection.release();
  }
}

// Ambil order terbaru (limit bisa di-set, misal 5)
async function getLatestOrders(limit = 5) {
  const connection = await db.getConnection();
  try {
    const [orders] = await connection.query(
      `SELECT id, user_id, customer_name, total, status, created_at 
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );
    return orders;
  } finally {
    connection.release();
  }
}

module.exports = {
  createOrder,
  updateOrderStatusById,
  getOrderById,
  getAllOrders,
  countAllOrders,
  getOrdersByUserId,
  getTotalOrdersToday,
  getLatestOrders
};
