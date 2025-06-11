const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportcontroller');

router.get('/pdf', reportController.exportOrdersPDF);
router.get('/excel', reportController.exportOrdersExcel);

module.exports = router;
