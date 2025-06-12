const PDFDocument = require('pdfkit');
const moment = require('moment');
const ExcelJS = require('exceljs');
const db = require('../config/db');

const formatRupiah = (number) => {
  return 'Rp ' + Number(number).toLocaleString('id-ID');
};

const buildQuery = (start, end) => {
  let baseQuery = `
    SELECT o.id, u.name AS user_name, o.total, o.status, o.created_at, o.user_id
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1 = 1
  `;
  const params = [];

  if (start) {
    baseQuery += ' AND DATE(o.created_at) >= ?';
    params.push(start);
  }
  if (end) {
    baseQuery += ' AND DATE(o.created_at) <= ?';
    params.push(end);
  }

  return { baseQuery, params };
};

exports.exportOrdersPDF = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { baseQuery, params } = buildQuery(start, end);

    const [orders] = await db.query(baseQuery, params);

    const [totalResult] = await db.query(`
      SELECT SUM(total) AS total_omset
      FROM orders
      WHERE 1 = 1
      ${start ? ' AND DATE(created_at) >= ?' : ''}
      ${end ? ' AND DATE(created_at) <= ?' : ''}
    `, params);

    const totalOmset = totalResult[0].total_omset || 0;
    const today = moment().format('YYYYMMDD');
    const fileName = `orders_${today}.pdf`;

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Toko Rayhan', { align: 'center' });
    doc.fontSize(12).text('Jl Mawar Raya No 01 C RT.3/RW.13, Bintaro, Kec. Pesanggrahan', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Laporan Data Pesanan', { align: 'center' });
    doc.fontSize(10).text(`Tanggal Cetak: ${moment().format('DD-MM-YYYY')}`, { align: 'center' });
    if (start || end) {
      doc.text(`Periode: ${start || '...'} s/d ${end || '...'}`, { align: 'center' });
    }
    doc.text(`Omset Bulanan: ${formatRupiah(totalOmset)}`, { align: 'center' });
    doc.moveDown();

    const drawTableHeader = (y) => {
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('No', 30, y);
      doc.text('ID Pesanan', 60, y);
      doc.text('Nama Pelanggan', 150, y);
      doc.text('Total', 300, y);
      doc.text('Status', 400, y);
      doc.font('Helvetica');
    };

    let y = 150;
    drawTableHeader(y);
    y += 20;

    orders.forEach((o, i) => {
      if (y > 700) {
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
  } catch (err) {
    console.error('PDF Export Error:', err);
    res.status(500).send('Gagal mengekspor PDF');
  }
};

exports.exportOrdersExcel = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { baseQuery, params } = buildQuery(start, end);

    const [orders] = await db.query(baseQuery, params);
    const [totalResult] = await db.query(`
      SELECT SUM(total) AS total_omset
      FROM orders
      WHERE 1 = 1
      ${start ? ' AND DATE(created_at) >= ?' : ''}
      ${end ? ' AND DATE(created_at) <= ?' : ''}
    `, params);

    const totalOmset = totalResult[0].total_omset || 0;
    const today = moment().format('YYYYMMDD');
    const fileName = `orders_${today}.xlsx`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'Toko Rayhan';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = 'Jl Mawar Raya No 01 C RT.3/RW.13, Bintaro, Kec. Pesanggrahan';
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

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'ID Pesanan', key: 'id', width: 15 },
      { header: 'Nama Pelanggan', key: 'user_name', width: 30 },
      { header: 'Total', key: 'total', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    orders.forEach((o, i) => {
      worksheet.addRow({
        no: i + 1,
        id: o.id,
        user_name: o.user_name || `User #${o.user_id}`,
        total: Number(o.total),
        status: o.status || 'Pending',
      });
    });

    worksheet.getColumn('total').numFmt = '"Rp"#,##0;[Red]-"Rp"#,##0';
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.alignment = { horizontal: 'center' };
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel Export Error:', err);
    res.status(500).send('Gagal mengekspor Excel');
  }
};
