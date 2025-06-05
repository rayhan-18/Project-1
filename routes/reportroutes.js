const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportcontroller'); // Pastikan file ini bernama 'reportcontroller.js'

// Endpoint untuk export PDF
// Contoh: http://localhost:3000/api/export/pdf?start=2025-06-01&end=2025-06-05
router.get('/pdf', reportController.exportOrdersPDF);

// Endpoint untuk export Excel
// Contoh: http://localhost:3000/api/export/excel?start=2025-06-01&end=2025-06-05
router.get('/excel', reportController.exportOrdersExcel);

module.exports = router;
