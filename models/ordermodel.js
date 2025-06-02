const db = require('../config/db'); // Sesuaikan dengan koneksi database kamu

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
    return result.affectedRows; // jumlah baris yang diupdate (0 = tidak ada)
  } finally {
    connection.release();
  }
}

// Get order detail + items by ID
async function getOrderById(orderId) {
  const connection = await db.getConnection();
  try {
    // Ambil data order utama
    const [orders] = await connection.query(
      `SELECT * FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return null; // Tidak ada order dengan ID tersebut
    }

    const order = orders[0];

    // Ambil item detail
    const [items] = await connection.query(
      `SELECT product_id, product_name, quantity, price FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    return { ...order, items };
  } finally {
    connection.release();
  }
}

// Get semua orders
async function getAllOrders() {
  const connection = await db.getConnection();
  try {
    const [orders] = await connection.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
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
  getAllOrders
};
