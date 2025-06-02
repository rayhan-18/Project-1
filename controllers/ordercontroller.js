const { createOrder } = require('../models/ordermodel');

const placeOrder = async (req, res) => {
  try {
    const {
      user_id,
      items,
      shipping,
      payment_method,
      subtotal,
      tax,
      total,
    } = req.body;

    // Validasi sederhana
    if (
      !user_id ||
      !shipping ||
      !shipping.name ||
      !shipping.phone ||
      !shipping.address ||
      !shipping.method ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ message: 'Data order tidak lengkap' });
    }

    const orderData = {
      user_id,
      customer_name: shipping.name,
      customer_phone: shipping.phone,
      customer_address: shipping.address,
      shipping_method: shipping.method,
      shipping_cost: shipping.cost,
      payment_method,
      subtotal,
      tax,
      total,
      items,
    };

    const orderId = await createOrder(orderData);

    res.status(201).json({
      message: 'Order berhasil dibuat',
      orderId,
    });
  } catch (error) {
    console.error('Error di placeOrder:', error);
    res.status(500).json({
      message: 'Gagal membuat order',
      error: error.message,
    });
  }
};

module.exports = { placeOrder };
