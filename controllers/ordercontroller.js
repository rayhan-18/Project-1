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
      total
    } = req.body;

    if (!user_id || !shipping || !shipping.name || !shipping.phone || !shipping.address) {
      return res.status(400).json({ message: 'Data pengiriman tidak lengkap' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order harus memiliki item' });
    }

    const orderData = {
      customer_name: shipping.name,
      customer_phone: shipping.phone,
      customer_address: shipping.address,
      shipping_method: shipping.method,
      shipping_cost: shipping.cost,
      payment_method,
      subtotal,
      tax,
      total,
      items
    };

    const orderId = await createOrder(orderData);

    res.status(201).json({
      message: 'Order berhasil dibuat',
      orderId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error di placeOrder:', error);
    res.status(500).json({
      message: 'Gagal membuat order',
      error: error.message
    });
  }
};

module.exports = { placeOrder };
