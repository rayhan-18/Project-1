const express = require('express');
const router = express.Router();
const Contact = require('../models/contactmodel');

// =============================
// 📩 POST /api/contacts
// Simpan pesan dari form kontak
// =============================
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const insertId = await Contact.save({ name, email, subject, message });
    res.status(201).json({
      message: 'Pesan berhasil dikirim.',
      id: insertId
    });
  } catch (error) {
    console.error('❌ Gagal simpan pesan kontak:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
  }
});

// =============================
// 📋 GET /api/contacts
// Ambil semua pesan (filter, pencarian, pagination)
// =============================
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      start = '',
      end = ''
    } = req.query;

    const result = await Contact.getFilteredContacts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      start,
      end
    });

    res.json(result);
  } catch (error) {
    console.error('❌ Gagal ambil daftar pesan kontak:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
  }
});

// =============================
// 🗑️ DELETE /api/contacts/:id
// Hapus satu pesan kontak
// =============================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const success = await Contact.delete(id);
    if (!success) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan.' });
    }

    res.json({ message: 'Pesan berhasil dihapus.' });
  } catch (error) {
    console.error('❌ Gagal menghapus pesan kontak:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
  }
});

// =============================
// ✅ PATCH /api/contacts/:id/read
// Tandai pesan sebagai "dibaca"
// =============================
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const success = await Contact.markAsRead(id);
    if (!success) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan.' });
    }

    res.json({ message: 'Pesan berhasil ditandai sebagai dibaca.' });
  } catch (error) {
    console.error('❌ Gagal tandai pesan sebagai dibaca:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
  }
});

// =============================
// (Opsional) GET /api/contacts/:id
// Ambil detail 1 pesan kontak
// =============================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.getById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan.' });
    }

    res.json(contact);
  } catch (error) {
    console.error('❌ Gagal ambil detail pesan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
  }
});

module.exports = router;
