const db = require('../config/db');
const { Parser } = require('json2csv');
const {
  createOrder,
  updateOrderStatusById,
  getOrderById,
  getAllOrders,
  getOrdersByUserId,
  getTotalOrdersToday,
  getLatestOrders
} = require('../models/ordermodel');

// Buat order baru
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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order harus memiliki item' });
    }

    for (const item of items) {
      const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [item.product_id]);
      if (productRows.length === 0) {
        return res.status(404).json({ message: `Produk ID ${item.product_id} tidak ditemukan` });
      }
      if (productRows[0].stock < item.quantity) {
        return res.status(400).json({ message: `Stok produk ID ${item.product_id} tidak mencukupi` });
      }
    }

    for (const item of items) {
      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
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
      status: 'pending',
      items
    };

    const orderId = await createOrder(orderData);

    if (!orderId) {
      return res.status(500).json({ message: 'Gagal membuat order: ID tidak tersedia' });
    }

    await db.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    res.status(201).json({
      message: 'Order berhasil dibuat',
      order_id: orderId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error di placeOrder:', error);
    res.status(500).json({ message: 'Gagal membuat order', error: error.message });
  }
};

// Update status order
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status harus diisi' });
    }

    status = status.toLowerCase();

    const validStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];
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

// Detail order
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

// Semua order dengan pagination dan filter
const getAllOrdersHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const startDate = req.query.start;
    const endDate = req.query.end;
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    let dataQuery = 'SELECT * FROM orders';
    const values = [];
    const whereClauses = [];

    if (status) {
      whereClauses.push('status = ?');
      values.push(status);
    }

    if (startDate) {
      whereClauses.push('DATE(created_at) >= ?');
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push('DATE(created_at) <= ?');
      values.push(endDate);
    }

    if (whereClauses.length > 0) {
      const whereStatement = ' WHERE ' + whereClauses.join(' AND ');
      countQuery += whereStatement;
      dataQuery += whereStatement;
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [countRows] = await db.query(countQuery, values.slice(0, -2)); // Exclude limit/offset for count
    const [orders] = await db.query(dataQuery, values);

    res.json({
      total: countRows[0].total,
      currentPage: page,
      totalPages: Math.ceil(countRows[0].total / limit),
      orders
    });
  } catch (error) {
    console.error('Error di getAllOrdersHandler:', error);
    res.status(500).json({ message: 'Gagal mendapatkan daftar orders', error: error.message });
  }
};

// Order berdasarkan user
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await getOrdersByUserId(userId);
    res.json(orders);
  } catch (error) {
    console.error('Error di getOrdersByUser:', error);
    res.status(500).json({ message: 'Gagal mengambil pesanan user', error: error.message });
  }
};

// Ringkasan order untuk dashboard admin
const getOrderSummary = async (req, res) => {
  try {
    const totalToday = await getTotalOrdersToday();
    const latestOrders = await getLatestOrders(5);

    res.json({
      totalToday,
      latestOrders
    });
  } catch (error) {
    console.error('Error di getOrderSummary:', error);
    res.status(500).json({ message: 'Gagal mengambil ringkasan pesanan', error: error.message });
  }
};

// Export ke CSV
const exportOrdersToCSV = async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');

    const fields = ['id', 'user_id', 'customer_name', 'customer_phone', 'customer_address', 'payment_method', 'status', 'total', 'created_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);

    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error di exportOrdersToCSV:', error);
    res.status(500).json({ message: 'Gagal mengekspor data orders', error: error.message });
  }
};

module.exports = {
  placeOrder,
  updateOrderStatus,
  getOrderDetail,
  getAllOrders: getAllOrdersHandler,
  getOrdersByUser,
  getOrderSummary,
  exportOrdersToCSV // ✅ Tambahkan ini
};
