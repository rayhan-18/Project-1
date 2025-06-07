const PDFDocument = require('pdfkit');
const moment = require('moment');
const ExcelJS = require('exceljs');
const db = require('../config/db'); // Sesuaikan path

const formatRupiah = (number) => {
  return 'Rp ' + Number(number).toLocaleString('id-ID');
};

exports.exportOrdersPDF = async (req, res) => {
  const { start, end } = req.query;

  let query = `
    SELECT o.id, u.name AS user_name, o.total, o.status, o.created_at, o.user_id
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1 = 1
  `;
  const params = [];

  if (start) {
    query += ' AND DATE(o.created_at) >= ?';
    params.push(start);
  }
  if (end) {
    query += ' AND DATE(o.created_at) <= ?';
    params.push(end);
  }

  const [orders] = await db.query(query, params);

  // Hitung total omset
  const [totalResult] = await db.query(`
    SELECT SUM(total) AS total_omset
    FROM orders
    WHERE 1 = 1
    ${start ? ' AND DATE(created_at) >= ?' : ''}
    ${end ? ' AND DATE(created_at) <= ?' : ''}
  `, params);
  const totalOmset = totalResult[0].total_omset || 0;

  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.pdf');
  doc.pipe(res);

  // Header utama
  doc.fontSize(18).text('Toko Rayhan', { align: 'center' });
  doc.fontSize(12).text('Jl. Contoh Alamat No.123, Jakarta', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('Laporan Data Pesanan', { align: 'center' });
  doc.fontSize(10).text(`Tanggal Cetak: ${moment().format('DD-MM-YYYY')}`, { align: 'center' });

  if (start || end) {
    doc.text(`Periode: ${start || '...'} s/d ${end || '...'}`, { align: 'center' });
  }

  doc.text(`Omset Bulanan: ${formatRupiah(totalOmset)}`, { align: 'center' });

  doc.moveDown();

  function drawTableHeader(yPos) {
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('No', 30, yPos);
    doc.text('ID Pesanan', 60, yPos);
    doc.text('Nama Pelanggan', 150, yPos);
    doc.text('Total', 300, yPos);
    doc.text('Status', 400, yPos);
    doc.font('Helvetica');
  }

  let y = 150; // posisi awal tabel

  drawTableHeader(y);
  y += 20;

  const bottomMargin = 700;

  orders.forEach((o, i) => {
    if (y > bottomMargin) {
      doc.addPage();
      y = 50;
      drawTableHeader(y);
      y += 20;
    }

    doc.text(i + 1, 30, y);
    doc.text(o.id, 60, y);
    doc.text(o.user_name || `User #${o.user_id}`, 150, y);
    doc.text(formatRupiah(o.total), 300, y);
    doc.text(o.status || 'Pending', 400, y);
    y += 20;
  });

  doc.end();
};

exports.exportOrdersExcel = async (req, res) => {
  const { start, end } = req.query;

  let query = `
    SELECT o.id, u.name AS user_name, o.total, o.status, o.created_at, o.user_id
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1 = 1
  `;
  const params = [];

  if (start) {
    query += ' AND DATE(o.created_at) >= ?';
    params.push(start);
  }
  if (end) {
    query += ' AND DATE(o.created_at) <= ?';
    params.push(end);
  }

  const [orders] = await db.query(query, params);

  // Hitung total omset
  const [totalResult] = await db.query(`
    SELECT SUM(total) AS total_omset
    FROM orders
    WHERE 1 = 1
    ${start ? ' AND DATE(created_at) >= ?' : ''}
    ${end ? ' AND DATE(created_at) <= ?' : ''}
  `, params);
  const totalOmset = totalResult[0].total_omset || 0;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  // Judul
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'Toko Rayhan';
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:E2');
  worksheet.getCell('A2').value = 'Jl. Contoh Alamat No.123, Jakarta';
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A3:E3');
  worksheet.getCell('A3').value = 'Laporan Data Pesanan';
  worksheet.getCell('A3').font = { bold: true };
  worksheet.getCell('A3').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A4:E4');
  worksheet.getCell('A4').value = `Tanggal Cetak: ${moment().format('DD-MM-YYYY')}`;
  worksheet.getCell('A4').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A5:E5');
  worksheet.getCell('A5').value = `Periode: ${start || '...'} s/d ${end || '...'}`;
  worksheet.getCell('A5').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A6:E6');
  worksheet.getCell('A6').value = `Omset Bulanan: ${formatRupiah(totalOmset)}`;
  worksheet.getCell('A6').alignment = { horizontal: 'center' };

  worksheet.addRow([]);
  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['No', 'ID Pesanan', 'Nama Pelanggan', 'Total', 'Status']);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };

  worksheet.columns = [
    { key: 'no', width: 5 },
    { key: 'id', width: 15 },
    { key: 'user_name', width: 30 },
    { key: 'total', width: 15 },
    { key: 'status', width: 15 },
  ];

  orders.forEach((o, i) => {
    const row = worksheet.addRow([
      i + 1,
      o.id,
      o.user_name || `User #${o.user_id}`,
      Number(o.total), // pastikan number, bukan string
      o.status || 'Pending'
    ]);
    row.alignment = { horizontal: 'center' };
  });

  worksheet.getColumn(4).numFmt = '"Rp"#,##0;[Red]\-"Rp"#,##0';

  res.setHeader('Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition',
    'attachment; filename=orders.xlsx');

  await workbook.xlsx.write(res);
  res.end();
};
