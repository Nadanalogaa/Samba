const { Router } = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /api/cash/bills/:id/pdf - Generate PDF for a cash bill
router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const billId = req.params.id;

    // Fetch bill + order + items
    const { rows: bills } = await pool.query(
      `SELECT cb.*, co.order_no, co.subtotal, co.discount_percent, co.discount_amount, co.total_qty, co.contact_person, co.contact_mobile,
              co.walk_in_name, co.walk_in_address1, co.walk_in_address2, co.walk_in_pin,
              cm.customer_name, cm.customer_code, cm.address1, cm.address2, cm.phone as cust_phone,
              d.name as district_name, d.address_line1 as dist_addr
       FROM cash_bills cb
       JOIN cash_orders co ON cb.order_id = co.id
       LEFT JOIN customer_master cm ON co.customer_id = cm.id
       JOIN districts d ON cb.district_code = d.code
       WHERE cb.id = $1`,
      [billId]
    );
    if (bills.length === 0) return res.status(404).json({ error: 'Bill not found' });

    const bill = bills[0];
    const { rows: items } = await pool.query(
      `SELECT coi.*, rm.short_title, rm.book_code, rm.title_name
       FROM cash_order_items coi
       JOIN rate_master rm ON coi.book_id = rm.id
       WHERE coi.order_id = $1 ORDER BY coi.sl_no`,
      [bill.order_id]
    );

    // Update print count
    await pool.query('UPDATE cash_bills SET printed_at = NOW(), print_count = print_count + 1 WHERE id = $1', [billId]);

    // Generate PDF
    const doc = new PDFDocument({ size: 'A5', margin: 30 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=CashBill_${bill.bill_no.replace(/\//g, '-')}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(11).font('Helvetica-Bold').text('SAMBA PUBLISHING COMPANY PVT LTD', { align: 'center' });
    doc.fontSize(8).font('Helvetica').text('152, Peters Road, Chennai-600 086', { align: 'center' });
    doc.text('GSTIN: 33AAACS6646R1ZS  ST.CODE: 33', { align: 'center' });
    doc.text('HSN CODE: 49011010 & 49030020', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold').text('CASH BILL', { align: 'center' });
    doc.moveDown(0.3);

    // Bill info
    doc.fontSize(9).font('Helvetica');
    const billDate = new Date(bill.bill_date).toLocaleDateString('en-IN');
    doc.text(`BILL NO: ${bill.bill_no}`, 30);
    doc.text(`DATE: ${billDate}`, 30 + 250, doc.y - doc.currentLineHeight(), { align: 'right' });
    doc.moveDown(0.3);

    if (bill.customer_name) {
      doc.text(`Customer: ${bill.customer_name} (${bill.customer_code})`);
    } else if (bill.walk_in_name) {
      doc.text(`Customer: ${bill.walk_in_name} (Walk-in)`);
    }

    // Walk-in address lines
    if (!bill.customer_name && (bill.walk_in_address1 || bill.walk_in_address2 || bill.walk_in_pin)) {
      if (bill.walk_in_address1) doc.text(bill.walk_in_address1);
      if (bill.walk_in_address2) doc.text(bill.walk_in_address2);
      if (bill.walk_in_pin) doc.text(`Pin: ${bill.walk_in_pin}`);
    }

    if (bill.contact_person) doc.text(`Contact: ${bill.contact_person}`);
    if (bill.contact_mobile) doc.text(`Mobile: ${bill.contact_mobile}`);
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const col = { sl: 30, book: 60, qty: 220, price: 270, amt: 330 };
    doc.font('Helvetica-Bold').fontSize(8);
    doc.text('SL', col.sl, tableTop);
    doc.text('BOOK NAME', col.book, tableTop);
    doc.text('QTY', col.qty, tableTop);
    doc.text('PRICE', col.price, tableTop);
    doc.text('AMOUNT', col.amt, tableTop);

    doc.moveTo(30, tableTop + 12).lineTo(380, tableTop + 12).stroke();

    // Items
    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 16;
    for (const item of items) {
      doc.text(String(item.sl_no), col.sl, y);
      doc.text(item.short_title, col.book, y);
      doc.text(String(item.qty), col.qty, y);
      doc.text(Number(item.rate).toFixed(2), col.price, y);
      doc.text(Number(item.amount).toFixed(2), col.amt, y);
      y += 14;
    }

    // Totals
    doc.moveTo(30, y).lineTo(380, y).stroke();
    y += 4;
    doc.font('Helvetica-Bold');
    doc.text(String(bill.total_qty), col.qty, y);
    doc.text(Number(bill.subtotal).toFixed(2), col.amt, y);
    y += 14;

    if (+bill.discount_amount > 0) {
      doc.font('Helvetica').text(`Less Discount (${bill.discount_percent}%)`, col.book, y);
      doc.text(Number(bill.discount_amount).toFixed(2), col.amt, y);
      y += 14;
    }

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('NET AMOUNT', col.book, y);
    doc.text(Number(bill.net_amount).toFixed(2), col.amt, y);
    y += 24;

    // Footer
    doc.font('Helvetica').fontSize(7);
    doc.text(`Ref no: ${bill.order_no}`, 30, y);
    doc.text('E.&.O.E', 30, y + 10);
    doc.text('for SAMBA PUBLISHING CO. P.LTD', 200, y + 10);
    doc.text('MANAGER', 280, y + 26);

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/bills - List all bills
router.get('/', authenticate, async (req, res) => {
  try {
    const { district, from, to } = req.query;
    const districts = district ? [district] : req.user.districts;

    const { rows } = await pool.query(
      `SELECT cb.*, co.total_qty, co.subtotal, co.discount_percent, co.discount_amount,
              cm.customer_name, cm.customer_code
       FROM cash_bills cb
       JOIN cash_orders co ON cb.order_id = co.id
       LEFT JOIN customer_master cm ON co.customer_id = cm.id
       WHERE cb.district_code = ANY($1) AND cb.bill_date BETWEEN $2 AND $3
       ORDER BY cb.created_at DESC`,
      [districts, from || '2026-01-01', to || '2099-12-31']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
