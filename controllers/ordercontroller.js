const db = require('../config/db'); // ← untuk koneksi ke database
const {createOrder,updateOrderStatusById,getOrderById,getAllOrders} = require('../models/ordermodel'); // ← tempat fungsi-fungsi order berada

// Buat order
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

    // Validasi data
    if (!user_id || !shipping || !shipping.name || !shipping.phone || !shipping.address) {
      return res.status(400).json({ message: 'Data pengiriman tidak lengkap' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order harus memiliki item' });
    }

    // 1. Validasi stok produk sebelum membuat order
    for (const item of items) {
      const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [item.product_id]);
      if (productRows.length === 0) {
        return res.status(404).json({ message: `Produk dengan ID ${item.product_id} tidak ditemukan` });
      }
      if (productRows[0].stock < item.quantity) {
        return res.status(400).json({ message: `Stok produk ${item.product_id} tidak mencukupi` });
      }
    }

    // 2. Kurangi stok produk
    for (const item of items) {
      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', 
        [item.quantity, item.product_id]);
    }

    // 3. Buat order
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
      status: 'pending',
      items
    };

    const orderId = await createOrder(orderData);

    if (!orderId) {
      return res.status(500).json({ message: 'Gagal membuat order: ID tidak tersedia' });
    }

    // 4. Hapus cart user setelah order berhasil dibuat
    await db.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    res.status(201).json({
      message: 'Order berhasil dibuat',
      order_id: orderId,
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

// Update status order
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const updated = await updateOrderStatusById(id, status);
    if (updated === 0) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    res.json({ message: 'Status order berhasil diupdate', status });
  } catch (error) {
    console.error('Error di updateOrderStatus:', error);
    res.status(500).json({ message: 'Gagal update status order', error: error.message });
  }
};

// Get detail order by ID
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error di getOrderDetail:', error);
    res.status(500).json({ message: 'Gagal mendapatkan detail order', error: error.message });
  }
};

// Get all orders
const getAllOrdersHandler = async (req, res) => {
  try {
    const orders = await getAllOrders();  // ini fungsi dari model
    res.json(orders);
  } catch (error) {
    console.error('Error di getAllOrdersHandler:', error);
    res.status(500).json({ message: 'Gagal mendapatkan daftar orders', error: error.message });
  }
};

module.exports = {
  placeOrder,
  updateOrderStatus,
  getOrderDetail,
  getAllOrders: getAllOrdersHandler,  // ekspor dengan nama getAllOrders agar routes tetap jalan
};  