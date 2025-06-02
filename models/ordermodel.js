const db = require('../config/db'); // Sesuaikan dengan file koneksi database kamu

async function createOrder(orderData) {
  const connection = await db.getConnection(); // Gunakan koneksi pool
  try {
    await connection.beginTransaction();

    // Insert ke tabel orders
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (customer_name, customer_phone, customer_address, shipping_method, shipping_cost, payment_method, subtotal, tax, total, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        orderData.customer_name,
        orderData.customer_phone,
        orderData.customer_address,
        orderData.shipping_method,
        orderData.shipping_cost,
        orderData.payment_method,
        orderData.subtotal,
        orderData.tax,
        orderData.total
      ]
    );

    const orderId = orderResult.insertId;

    // Insert ke tabel order_items
    for (const item of orderData.items) {
      await connection.query(
        `INSERT INTO order_items 
          (order_id, product_id, product_name, quantity, price) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,  // Harus sudah ada di data item dari frontend
          item.quantity,
          item.price
        ]
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

module.exports = { createOrder };
