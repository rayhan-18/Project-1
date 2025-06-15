// ordermodel.js (refaktor siap pakai, dukung kolom cancelled_by)
const db = require('../config/db');

const createOrder = async (orderData) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(`
      INSERT INTO orders 
      (user_id, customer_name, customer_phone, customer_address, shipping_method, shipping_cost, payment_method, subtotal, tax, total, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`, [
      orderData.user_id,
      orderData.customer_name,
      orderData.customer_phone,
      orderData.customer_address,
      orderData.shipping_method,
      orderData.shipping_cost,
      orderData.payment_method,
      orderData.subtotal,
      orderData.tax,
      orderData.total
    ]);

    const orderId = orderResult.insertId;

    for (const item of orderData.items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.quantity, item.price]
      );
    }

    const pd = orderData.payment_details || {};
    const expiry_time = new Date(Date.now() + 86400000); // 24 jam

    await conn.query(`
      INSERT INTO payment_details 
      (order_id, payment_method, bank_name, virtual_account, wallet_name, phone_number, amount, expiry_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
      orderId,
      orderData.payment_method,
      orderData.payment_method === 'transfer' ? pd.bank_name : null,
      orderData.payment_method === 'transfer' ? pd.virtual_account : null,
      orderData.payment_method === 'ewallet' ? pd.wallet_name : null,
      orderData.payment_method === 'ewallet' ? pd.phone_number : null,
      pd.amount || orderData.total,
      expiry_time
    ]);

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const updateOrderStatusById = async (orderId, newStatus) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [newStatus, orderId]
    );
    return result.affectedRows;
  } finally {
    conn.release();
  }
};

const getOrderById = async (orderId) => {
  const conn = await db.getConnection();
  try {
    const [orders] = await conn.query(`
      SELECT o.*, pd.bank_name, pd.virtual_account, pd.wallet_name, pd.phone_number
      FROM orders o
      LEFT JOIN payment_details pd ON o.id = pd.order_id
      WHERE o.id = ?`, [orderId]);

    if (!orders.length) return null;

    const order = orders[0];
    const [items] = await conn.query(
      `SELECT product_id, product_name, quantity, price FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    const { bank_name, virtual_account, wallet_name, phone_number, ...rest } = order;
    return {
      ...rest,
      items,
      payment_details: { bank_name, virtual_account, wallet_name, phone_number }
    };
  } finally {
    conn.release();
  }
};

const getAllOrders = async (limit = 10, offset = 0, status = null) => {
  const conn = await db.getConnection();
  try {
    let query = `SELECT * FROM orders`;
    const values = [];
    if (status) {
      query += ` WHERE status = ?`;
      values.push(status);
    }
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const [orders] = await conn.query(query, values);
    return orders;
  } finally {
    conn.release();
  }
};

const countAllOrders = async (status = null) => {
  const conn = await db.getConnection();
  try {
    let query = `SELECT COUNT(*) AS total FROM orders`;
    const values = [];
    if (status) {
      query += ` WHERE status = ?`;
      values.push(status);
    }
    const [rows] = await conn.query(query, values);
    return rows[0].total;
  } finally {
    conn.release();
  }
};

const getOrdersByUserId = async (userId) => {
  const conn = await db.getConnection();
  try {
    const [orders] = await conn.query(`
      SELECT o.*, pd.bank_name, pd.virtual_account, pd.wallet_name, pd.phone_number
      FROM orders o
      LEFT JOIN payment_details pd ON o.id = pd.order_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`, [userId]);

    return orders.map(o => {
      const { bank_name, virtual_account, wallet_name, phone_number, ...rest } = o;
      return {
        ...rest,
        payment_details: { bank_name, virtual_account, wallet_name, phone_number }
      };
    });
  } finally {
    conn.release();
  }
};

const getTotalOrdersToday = async () => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT COUNT(*) AS total_today 
      FROM orders 
      WHERE DATE(created_at) = CURDATE()
      AND status NOT IN ('batal', 'cancelled')`);
    return rows[0].total_today || 0;
  } finally {
    conn.release();
  }
};

const getLatestOrders = async (limit = 5) => {
  const conn = await db.getConnection();
  try {
    const [orders] = await conn.query(`
      SELECT id, user_id, customer_name, total, status, created_at 
      FROM orders 
      WHERE status NOT IN ('batal', 'cancelled')
      ORDER BY created_at DESC 
      LIMIT ?`, [limit]);
    return orders;
  } finally {
    conn.release();
  }
};

const getTotalIncomeToday = async () => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT SUM(total) AS total_income FROM orders 
      WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = CURDATE()
      AND status NOT IN ('batal', 'cancelled')`);
    return rows[0].total_income || 0;
  } finally {
    conn.release();
  }
};

const getProductCount = async () => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(`SELECT COUNT(*) AS product_count FROM products WHERE is_active = 1`);
    return rows[0].product_count || 0;
  } finally {
    conn.release();
  }
};

const getWeeklyOrderStats = async () => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) AS date, COUNT(*) AS count
      FROM orders
      WHERE CONVERT_TZ(created_at, '+00:00', '+07:00') >= CURDATE() - INTERVAL 6 DAY
      AND status NOT IN ('batal', 'cancelled')
      GROUP BY DATE(CONVERT_TZ(created_at, '+00:00', '+07:00'))
      ORDER BY date`);
    return rows;
  } finally {
    conn.release();
  }
};

module.exports = {
  createOrder,
  updateOrderStatusById,
  getOrderById,
  getAllOrders,
  countAllOrders,
  getOrdersByUserId,
  getTotalOrdersToday,
  getLatestOrders,
  getTotalIncomeToday,
  getProductCount,
  getWeeklyOrderStats
};
