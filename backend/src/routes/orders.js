const { Router } = require('express');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /api/cash/orders - List orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { district, status, date_from, date_to, search } = req.query;
    let sql = `SELECT co.*, cm.customer_name, cm.customer_code, cm.contact_person as cust_contact,
               (SELECT COUNT(*) FROM cash_order_items WHERE order_id = co.id) as item_count
               FROM cash_orders co
               LEFT JOIN customer_master cm ON co.customer_id = cm.id
               WHERE co.district_code = ANY($1)`;
    const params = [req.user.districts];

    if (district) { params.push(district); sql += ` AND co.district_code = $${params.length}`; }
    if (status) { params.push(status); sql += ` AND co.status = $${params.length}`; }
    if (date_from) { params.push(date_from); sql += ` AND co.order_date >= $${params.length}`; }
    if (date_to) { params.push(date_to); sql += ` AND co.order_date <= $${params.length}`; }
    if (search) { params.push(`%${search}%`); sql += ` AND (co.order_no ILIKE $${params.length} OR cm.customer_name ILIKE $${params.length})`; }

    sql += ' ORDER BY co.created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/orders/:id - Get order with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      `SELECT co.*, cm.customer_name, cm.customer_code, cm.address1, cm.address2, cm.phone as cust_phone, cm.customer_type,
              dc.discount_percent as type_discount
       FROM cash_orders co
       LEFT JOIN customer_master cm ON co.customer_id = cm.id
       LEFT JOIN discount_config dc ON cm.customer_type = dc.type_code
       WHERE co.id = $1`,
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const { rows: items } = await pool.query(
      `SELECT coi.*, rm.book_code, rm.title_name, rm.short_title, rm.standard
       FROM cash_order_items coi
       JOIN rate_master rm ON coi.book_id = rm.id
       WHERE coi.order_id = $1 ORDER BY coi.sl_no`,
      [req.params.id]
    );

    const { rows: bills } = await pool.query(
      'SELECT * FROM cash_bills WHERE order_id = $1', [req.params.id]
    );

    res.json({ ...orders[0], items, bills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cash/orders - Create order (proforma)
router.post('/', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { customer_id, contact_person, contact_mobile, discount_percent, district_code, items, notes,
            walk_in_name, walk_in_address1, walk_in_address2, walk_in_pin, walk_in_email } = req.body;

    if (!district_code || !items || items.length === 0) {
      return res.status(400).json({ error: 'district_code and items are required' });
    }

    // Validate Indian mobile number if provided
    if (contact_mobile && !/^[6-9]\d{9}$/.test(contact_mobile)) {
      return res.status(400).json({ error: 'Mobile must be 10 digits starting with 6-9 (Indian format)' });
    }
    if (walk_in_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(walk_in_email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Generate proforma number
    const { rows: seq } = await client.query(
      'UPDATE bill_sequences SET last_proforma_no = last_proforma_no + 1 WHERE district_code = $1 RETURNING last_proforma_no',
      [district_code]
    );
    const proformaNo = `${district_code}/PF/${String(seq[0].last_proforma_no).padStart(5, '0')}`;

    // Calculate totals (with per-item discount support)
    let subtotal = 0;
    let totalQty = 0;
    const resolvedItems = [];

    for (const item of items) {
      const { rows: books } = await client.query('SELECT * FROM rate_master WHERE id = $1', [item.book_id]);
      if (books.length === 0) throw new Error(`Book not found: ${item.book_id}`);
      const rate = Number(books[0].rate);
      const itemDiscPct = Number(item.discount_percent || 0);
      const gross = rate * item.qty;
      const itemDiscAmt = Math.round(gross * itemDiscPct / 100 * 100) / 100;
      const amount = gross - itemDiscAmt;
      subtotal += amount;
      totalQty += item.qty;
      resolvedItems.push({ ...item, rate, discount_percent: itemDiscPct, discount_amount: itemDiscAmt, amount });
    }

    const disc = discount_percent || 0;
    const discountAmount = Math.round(subtotal * disc / 100 * 100) / 100;
    const netAmount = subtotal - discountAmount;

    // Insert order
    const { rows: orderRows } = await client.query(
      `INSERT INTO cash_orders (order_no, customer_id, contact_person, contact_mobile, walk_in_name, walk_in_address1, walk_in_address2, walk_in_pin, walk_in_email, discount_percent, subtotal, discount_amount, net_amount, total_qty, district_code, status, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'proforma',$16,$17) RETURNING *`,
      [proformaNo, customer_id || null, contact_person || '', contact_mobile || '',
       walk_in_name || '', walk_in_address1 || '', walk_in_address2 || '', walk_in_pin || '', walk_in_email || '',
       disc, subtotal, discountAmount, netAmount, totalQty, district_code, notes || '', req.user.id]
    );
    const orderId = orderRows[0].id;

    // Insert items
    for (let i = 0; i < resolvedItems.length; i++) {
      const it = resolvedItems[i];
      await client.query(
        'INSERT INTO cash_order_items (order_id, sl_no, book_id, qty, rate, discount_percent, discount_amount, amount) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [orderId, i + 1, it.book_id, it.qty, it.rate, it.discount_percent, it.discount_amount, it.amount]
      );
    }

    await client.query('COMMIT');

    // Fetch full order
    const { rows: full } = await pool.query(
      `SELECT co.*, cm.customer_name, cm.customer_code FROM cash_orders co LEFT JOIN customer_master cm ON co.customer_id = cm.id WHERE co.id = $1`,
      [orderId]
    );
    res.status(201).json(full[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/cash/orders/:id/items - Update items on an order
router.put('/:id/items', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { items, discount_percent } = req.body;
    const orderId = req.params.id;

    // Delete existing items
    await client.query('DELETE FROM cash_order_items WHERE order_id = $1', [orderId]);

    let subtotal = 0;
    let totalQty = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { rows: books } = await client.query('SELECT rate FROM rate_master WHERE id = $1', [item.book_id]);
      const rate = Number(books[0].rate);
      const itemDiscPct = Number(item.discount_percent || 0);
      const gross = rate * item.qty;
      const itemDiscAmt = Math.round(gross * itemDiscPct / 100 * 100) / 100;
      const amount = gross - itemDiscAmt;
      subtotal += amount;
      totalQty += item.qty;

      await client.query(
        'INSERT INTO cash_order_items (order_id, sl_no, book_id, qty, rate, discount_percent, discount_amount, amount) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [orderId, i + 1, item.book_id, item.qty, rate, itemDiscPct, itemDiscAmt, amount]
      );
    }

    const disc = discount_percent ?? 0;
    const discountAmount = Math.round(subtotal * disc / 100 * 100) / 100;
    const netAmount = subtotal - discountAmount;

    await client.query(
      'UPDATE cash_orders SET subtotal=$1, discount_percent=$2, discount_amount=$3, net_amount=$4, total_qty=$5, updated_at=NOW() WHERE id=$6',
      [subtotal, disc, discountAmount, netAmount, totalQty, orderId]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/cash/orders/:id/generate-bill - Convert proforma to cash bill
router.post('/:id/generate-bill', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderId = req.params.id;

    const { rows: orders } = await client.query('SELECT * FROM cash_orders WHERE id = $1', [orderId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = orders[0];
    if (order.status === 'billed') return res.status(400).json({ error: 'Bill already generated for this order' });

    // Generate bill number
    const { rows: seq } = await client.query(
      'UPDATE bill_sequences SET last_bill_no = last_bill_no + 1 WHERE district_code = $1 RETURNING last_bill_no',
      [order.district_code]
    );
    const billNo = `${order.district_code}/CB/${String(seq[0].last_bill_no).padStart(5, '0')}`;

    // Create bill
    const { rows: billRows } = await client.query(
      `INSERT INTO cash_bills (bill_no, order_id, district_code, net_amount, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [billNo, orderId, order.district_code, order.net_amount, req.user.id]
    );

    // Update order status
    await client.query("UPDATE cash_orders SET status = 'billed', updated_at = NOW() WHERE id = $1", [orderId]);

    await client.query('COMMIT');
    res.status(201).json(billRows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/cash/orders/:id/pdf - Generate Proforma PDF
const PDFDocument = require('pdfkit');
router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      `SELECT co.*, cm.customer_name, cm.customer_code, cm.address1, cm.address2, cm.phone as cust_phone, cm.email as cust_email
       FROM cash_orders co
       LEFT JOIN customer_master cm ON co.customer_id = cm.id
       WHERE co.id = $1`,
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ error: 'Proforma not found' });
    const order = orders[0];

    const { rows: items } = await pool.query(
      `SELECT coi.*, rm.short_title, rm.book_code, rm.title_name FROM cash_order_items coi
       JOIN rate_master rm ON coi.book_id = rm.id WHERE coi.order_id = $1 ORDER BY coi.sl_no`,
      [order.id]
    );

    const doc = new PDFDocument({ size: 'A5', margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Proforma_${order.order_no.replace(/\//g, '-')}.pdf`);
    doc.pipe(res);

    doc.fontSize(11).font('Helvetica-Bold').text('SAMBA PUBLISHING COMPANY PVT LTD', { align: 'center' });
    doc.fontSize(8).font('Helvetica').text('152, Peters Road, Chennai-600 086', { align: 'center' });
    doc.text('GSTIN: 33AAACS6646R1ZS  ST.CODE: 33', { align: 'center' });
    doc.text('HSN CODE: 49011010 & 49030020', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold').text('PROFORMA INVOICE', { align: 'center' });
    doc.moveDown(0.3);

    doc.fontSize(9).font('Helvetica');
    const d = new Date(order.order_date).toLocaleDateString('en-IN');
    doc.text(`PROFORMA NO: ${order.order_no}`, 30);
    doc.text(`DATE: ${d}`, 30 + 250, doc.y - doc.currentLineHeight(), { align: 'right' });
    doc.moveDown(0.3);

    if (order.customer_name) {
      doc.text(`Customer: ${order.customer_name} (${order.customer_code})`);
      if (order.address1) doc.text(order.address1);
      if (order.address2) doc.text(order.address2);
    } else if (order.walk_in_name) {
      doc.text(`Customer: ${order.walk_in_name} (Walk-in)`);
      if (order.walk_in_address1) doc.text(order.walk_in_address1);
      if (order.walk_in_address2) doc.text(order.walk_in_address2);
      if (order.walk_in_pin) doc.text(`Pin: ${order.walk_in_pin}`);
      if (order.walk_in_email) doc.text(`Email: ${order.walk_in_email}`);
    }
    if (order.contact_person) doc.text(`Contact: ${order.contact_person}`);
    if (order.contact_mobile) doc.text(`Mobile: ${order.contact_mobile}`);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col = { sl: 30, book: 60, qty: 200, price: 240, disc: 290, amt: 330 };
    doc.font('Helvetica-Bold').fontSize(7);
    doc.text('SL', col.sl, tableTop);
    doc.text('BOOK NAME', col.book, tableTop);
    doc.text('QTY', col.qty, tableTop);
    doc.text('RATE', col.price, tableTop);
    doc.text('DISC%', col.disc, tableTop);
    doc.text('AMOUNT', col.amt, tableTop);
    doc.moveTo(30, tableTop + 11).lineTo(380, tableTop + 11).stroke();

    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 15;
    for (const it of items) {
      doc.text(String(it.sl_no), col.sl, y);
      doc.text(it.short_title, col.book, y);
      doc.text(String(it.qty), col.qty, y);
      doc.text(Number(it.rate).toFixed(2), col.price, y);
      doc.text(it.discount_percent > 0 ? `${it.discount_percent}%` : '-', col.disc, y);
      doc.text(Number(it.amount).toFixed(2), col.amt, y);
      y += 13;
    }

    doc.moveTo(30, y).lineTo(380, y).stroke();
    y += 4;
    doc.font('Helvetica-Bold');
    doc.text(String(order.total_qty), col.qty, y);
    doc.text(Number(order.subtotal).toFixed(2), col.amt, y);
    y += 14;

    if (+order.discount_amount > 0) {
      doc.font('Helvetica').text(`Less Order Discount (${order.discount_percent}%)`, col.book, y);
      doc.text(Number(order.discount_amount).toFixed(2), col.amt, y);
      y += 14;
    }
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('NET AMOUNT', col.book, y);
    doc.text(Number(order.net_amount).toFixed(2), col.amt, y);
    y += 24;

    doc.font('Helvetica-Oblique').fontSize(7).text('*** This is a PROFORMA, not a final invoice ***', 30, y, { align: 'center' });
    doc.font('Helvetica').fontSize(7);
    doc.text('E.&.O.E', 30, y + 20);
    doc.text('for SAMBA PUBLISHING CO. P.LTD', 200, y + 20);

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
