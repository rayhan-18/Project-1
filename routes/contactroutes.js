const express = require('express');
const router = express.Router();
const Contact = require('../models/contactmodel');

// POST /api/contact → Simpan pesan dari contact form
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  try {
    await Contact.save({ name, email, subject, message });
    res.json({ message: 'Pesan berhasil dikirim.' });
  } catch (error) {
    console.error('Gagal simpan pesan kontak:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/contact → Ambil semua pesan (untuk admin) dengan pagination
// Contoh: /api/contact?page=2&limit=5
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const messages = await Contact.getAll(page, limit);
    res.json(messages);
  } catch (error) {
    console.error('Gagal ambil pesan kontak:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// DELETE /api/contact/:id → Hapus pesan berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const success = await Contact.delete(id);

    if (!success) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan.' });
    }

    res.json({ message: 'Pesan berhasil dihapus.' });
  } catch (error) {
    console.error('Gagal hapus pesan kontak:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// PATCH /api/contact/:id/read → Tandai pesan sudah dibaca
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;

  try {
    const success = await Contact.markAsRead(id);

    if (!success) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan.' });
    }

    res.json({ message: 'Pesan berhasil ditandai sudah dibaca.' });
  } catch (error) {
    console.error('Gagal update status pesan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
