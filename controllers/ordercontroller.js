// ordercontroller.js (refaktor siap pakai dengan dukungan cancelled_by)
const db = require('../config/db');
const { Parser } = require('json2csv');
const {
  createOrder,
  updateOrderStatusById,
  getOrderById,
  getOrdersByUserId,
  getTotalOrdersToday,
  getLatestOrders
} = require('../models/ordermodel');

const getTotalIncomeToday = async () => {
  const [rows] = await db.query(`
    SELECT SUM(total) AS totalIncome
    FROM orders
    WHERE DATE(created_at) = CURDATE()
      AND status != 'cancelled'
  `);
  return rows[0].totalIncome || 0;
};

const getProductCount = async () => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(`SELECT COUNT(*) AS product_count FROM products`);
    return rows[0].product_count || 0;
  } finally {
    conn.release();
  }
};

const getWeeklyOrderStats = async () => {
  const [rows] = await db.query(`
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM orders
    WHERE created_at >= CURDATE() - INTERVAL 6 DAY
      AND status NOT IN ('cancelled', 'batal')
    GROUP BY DATE(created_at)
    ORDER BY date
  `);

  return rows.map(row => ({
    ...row,
    date: new Date(row.date).toLocaleDateString('id-ID')
  }));
};

const placeOrder = async (req, res) => {
  try {
    const {
      user_id, items, shipping, payment_method,
      subtotal, tax, total, payment_details
    } = req.body;

    if (!user_id || !shipping?.name || !shipping?.phone || !shipping?.address) {
      return res.status(400).json({ message: 'Data pengiriman tidak lengkap' });
    }
    if (!items?.length) {
      return res.status(400).json({ message: 'Order harus memiliki item' });
    }
    if (payment_method === 'transfer' && !payment_details?.virtual_account) {
      return res.status(400).json({ message: 'Virtual Account harus diisi untuk transfer' });
    }
    if (payment_method === 'ewallet' && !payment_details?.phone_number) {
      return res.status(400).json({ message: 'Nomor HP harus diisi untuk e-wallet' });
    }

    for (const item of items) {
      const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [item.product_id]);
      if (!productRows.length) return res.status(404).json({ message: `Produk ID ${item.product_id} tidak ditemukan` });
      if (productRows[0].stock < item.quantity) {
        return res.status(400).json({ message: `Stok produk ID ${item.product_id} tidak mencukupi` });
      }
    }

    for (const item of items) {
      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    const orderId = await createOrder({
      user_id,
      customer_name: shipping.name,
      customer_phone: shipping.phone,
      customer_address: shipping.address,
      shipping_method: shipping.method || null,
      shipping_cost: shipping.cost || 0,
      payment_method,
      subtotal, tax, total, items, payment_details
    });

    await db.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    res.status(201).json({ message: 'Order berhasil dibuat', order_id: orderId, status: 'pending' });
  } catch (error) {
    console.error('Error di placeOrder:', error);
    res.status(500).json({ message: 'Gagal membuat order', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) return res.status(400).json({ message: 'Status harus diisi' });

    status = status.toLowerCase();
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const order = await getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Status tidak bisa diubah karena pesanan sudah dibatalkan' });
    }

    if (status === 'cancelled') {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        for (const item of order.items) {
          await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
        await conn.query('UPDATE orders SET status = ?, cancelled_by = ? WHERE id = ?', [status, 'admin', id]);
        await conn.commit();
        return res.json({ message: 'Status order berhasil dibatalkan oleh admin', status });
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } else {
      const updated = await updateOrderStatusById(id, status);
      if (updated === 0) return res.status(404).json({ message: 'Order tidak ditemukan' });
      res.json({ message: 'Status order berhasil diupdate', status });
    }
  } catch (error) {
    console.error('Error di updateOrderStatus:', error);
    res.status(500).json({ message: 'Gagal update status order', error: error.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
    res.json(order);
  } catch (error) {
    console.error('Error di getOrderDetail:', error);
    res.status(500).json({ message: 'Gagal mendapatkan detail order', error: error.message });
  }
};

const getAllOrdersHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const search = req.query.search || null;
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    let dataQuery = 'SELECT * FROM orders';
    const values = [];
    const whereClauses = [];

    if (status) {
      whereClauses.push('status = ?');
      values.push(status);
    }

    if (search) {
      const cleanSearch = search.replace('User #', '').trim();
      whereClauses.push('(id LIKE ? OR customer_name LIKE ? OR user_id LIKE ?)');
      values.push(`%${search}%`, `%${search}%`, `%${cleanSearch}%`);
    }

    if (whereClauses.length > 0) {
      const whereStatement = ' WHERE ' + whereClauses.join(' AND ');
      countQuery += whereStatement;
      dataQuery += whereStatement;
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [countRows] = await db.query(countQuery, values.slice(0, -2));
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

const getOrderSummary = async (req, res) => {
  try {
    const totalToday = await getTotalOrdersToday();
    const totalIncome = await getTotalIncomeToday();
    const totalProducts = await getProductCount();
    const weeklyStats = await getWeeklyOrderStats();
    const latestOrders = await getLatestOrders(5);
    res.json({ totalToday, totalIncome, totalProducts, latestOrders, weeklyStats });
  } catch (error) {
    console.error('Error di getOrderSummary:', error);
    res.status(500).json({ message: 'Gagal mengambil ringkasan pesanan', error: error.message });
  }
};

const exportOrdersToCSV = async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    const fields = ['id', 'user_id', 'customer_name', 'customer_phone', 'customer_address', 'payment_method', 'status', 'cancelled_by', 'total', 'created_at'];
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
  exportOrdersToCSV
};
