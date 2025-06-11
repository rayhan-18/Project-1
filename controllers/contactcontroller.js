const Contact = require('../models/contactmodel');

// 📩 Ambil daftar pesan kontak dengan filter, pencarian, dan pagination
exports.getAllContacts = async (req, res) => {
  const { page, limit, search, start, end } = req.query;

  try {
    const result = await Contact.getFilteredContacts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || '',
      start: start || '',
      end: end || '',
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data kontak', error });
  }
};

// ✅ Ambil satu pesan kontak berdasarkan ID
exports.getContactById = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await Contact.getById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail pesan', error });
  }
};

// ✅ Tandai pesan sebagai dibaca
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await Contact.markAsRead(id);
    if (!updated) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan' });
    }

    res.json({ message: 'Pesan ditandai sebagai dibaca' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menandai pesan', error });
  }
};

// ✅ Hapus pesan kontak
exports.deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Contact.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan' });
    }

    res.json({ message: 'Pesan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pesan', error });
  }
};
