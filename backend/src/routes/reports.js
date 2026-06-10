const { Router } = require('express');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /api/cash/reports/day-end - Day end summary
router.get('/day-end', authenticate, async (req, res) => {
  try {
    const { date, district } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const districts = district ? [district] : req.user.districts;

    // Bills for the day
    const { rows: bills } = await pool.query(
      `SELECT cb.*, co.customer_id, co.total_qty, co.subtotal, co.discount_percent, co.discount_amount,
              cm.customer_name, cm.customer_code
       FROM cash_bills cb
       JOIN cash_orders co ON cb.order_id = co.id
       LEFT JOIN customer_master cm ON co.customer_id = cm.id
       WHERE cb.bill_date = $1 AND cb.district_code = ANY($2)
       ORDER BY cb.bill_no`,
      [targetDate, districts]
    );

    // Summary
    const { rows: summary } = await pool.query(
      `SELECT cb.district_code, COUNT(*) as bill_count, SUM(cb.net_amount) as total_amount,
              SUM(co.total_qty) as total_qty, SUM(co.discount_amount) as total_discount
       FROM cash_bills cb
       JOIN cash_orders co ON cb.order_id = co.id
       WHERE cb.bill_date = $1 AND cb.district_code = ANY($2)
       GROUP BY cb.district_code`,
      [targetDate, districts]
    );

    // Pending proformas
    const { rows: pending } = await pool.query(
      `SELECT COUNT(*) as count, SUM(net_amount) as amount
       FROM cash_orders WHERE status = 'proforma' AND district_code = ANY($1)`,
      [districts]
    );

    res.json({ date: targetDate, bills, summary, pending: pending[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/reports/cash-bill-list - Date range bill list
router.get('/cash-bill-list', authenticate, async (req, res) => {
  try {
    const { from, to, district } = req.query;
    const districts = district ? [district] : req.user.districts;

    const { rows } = await pool.query(
      `SELECT cb.bill_no, cb.bill_date, cb.net_amount, cb.district_code,
              co.order_no, co.total_qty, co.subtotal, co.discount_percent, co.discount_amount,
              cm.customer_name, cm.customer_code
       FROM cash_bills cb
       JOIN cash_orders co ON cb.order_id = co.id
       LEFT JOIN customer_master cm ON co.customer_id = cm.id
       WHERE cb.bill_date BETWEEN $1 AND $2 AND cb.district_code = ANY($3)
       ORDER BY cb.bill_date, cb.bill_no`,
      [from || '2026-01-01', to || '2099-12-31', districts]
    );

    // Totals
    const totals = { count: rows.length, amount: 0, qty: 0, discount: 0 };
    for (const r of rows) { totals.amount += +r.net_amount; totals.qty += +r.total_qty; totals.discount += +r.discount_amount; }

    res.json({ bills: rows, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/reports/customer-wise - Customer-wise sales
router.get('/customer-wise', authenticate, async (req, res) => {
  try {
    const { from, to, district } = req.query;
    const districts = district ? [district] : req.user.districts;

    const { rows } = await pool.query(
      `SELECT cm.customer_code, cm.customer_name, cm.customer_type, cm.district_code,
              COUNT(cb.id) as bill_count, SUM(co.total_qty) as total_qty,
              SUM(co.subtotal) as gross_amount, SUM(co.discount_amount) as total_discount,
              SUM(cb.net_amount) as net_amount
       FROM cash_bills cb
       JOIN cash_orders co ON cb.order_id = co.id
       JOIN customer_master cm ON co.customer_id = cm.id
       WHERE cb.bill_date BETWEEN $1 AND $2 AND cb.district_code = ANY($3)
       GROUP BY cm.customer_code, cm.customer_name, cm.customer_type, cm.district_code
       ORDER BY net_amount DESC`,
      [from || '2026-01-01', to || '2099-12-31', districts]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/reports/book-wise - Book-wise sales
router.get('/book-wise', authenticate, async (req, res) => {
  try {
    const { from, to, district, standard } = req.query;
    const districts = district ? [district] : req.user.districts;

    let sql = `SELECT rm.book_code, rm.title_name, rm.short_title, rm.standard, rm.rate,
              SUM(coi.qty) as total_qty, SUM(coi.amount) as total_amount,
              COUNT(DISTINCT cb.id) as bill_count
       FROM cash_order_items coi
       JOIN cash_orders co ON coi.order_id = co.id
       JOIN cash_bills cb ON cb.order_id = co.id
       JOIN rate_master rm ON coi.book_id = rm.id
       WHERE cb.bill_date BETWEEN $1 AND $2 AND cb.district_code = ANY($3)`;
    const params = [from || '2026-01-01', to || '2099-12-31', districts];

    if (standard) { params.push(standard); sql += ` AND rm.standard = $${params.length}`; }

    sql += ' GROUP BY rm.book_code, rm.title_name, rm.short_title, rm.standard, rm.rate ORDER BY total_qty DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/reports/district-comparison
router.get('/district-comparison', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT cb.district_code, d.name as district_name,
              COUNT(cb.id) as bill_count, SUM(cb.net_amount) as total_amount,
              SUM(co.total_qty) as total_qty, SUM(co.discount_amount) as total_discount,
              COUNT(DISTINCT co.customer_id) as unique_customers
       FROM cash_bills cb
       JOIN cash_orders co ON cb.order_id = co.id
       JOIN districts d ON cb.district_code = d.code
       WHERE cb.bill_date BETWEEN $1 AND $2 AND cb.district_code = ANY($3)
       GROUP BY cb.district_code, d.name
       ORDER BY total_amount DESC`,
      [from || '2026-01-01', to || '2099-12-31', req.user.districts]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/reports/dashboard - Dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const districts = req.user.districts;

    const [todayBills, todayAmount, pendingProformas, totalCustomers, totalBooks, monthlyBills] = await Promise.all([
      pool.query('SELECT COUNT(*) as c FROM cash_bills WHERE bill_date = $1 AND district_code = ANY($2)', [today, districts]),
      pool.query('SELECT COALESCE(SUM(net_amount),0) as amt FROM cash_bills WHERE bill_date = $1 AND district_code = ANY($2)', [today, districts]),
      pool.query("SELECT COUNT(*) as c, COALESCE(SUM(net_amount),0) as amt FROM cash_orders WHERE status = 'proforma' AND district_code = ANY($1)", [districts]),
      pool.query('SELECT COUNT(*) as c FROM customer_master WHERE district_code = ANY($1) AND is_active = true', [districts]),
      pool.query('SELECT COUNT(*) as c FROM rate_master WHERE is_active = true'),
      pool.query(
        `SELECT DATE_TRUNC('month', bill_date) as month, COUNT(*) as count, SUM(net_amount) as amount
         FROM cash_bills WHERE district_code = ANY($1) AND bill_date >= DATE_TRUNC('year', CURRENT_DATE)
         GROUP BY DATE_TRUNC('month', bill_date) ORDER BY month`,
        [districts]
      ),
    ]);

    res.json({
      today_bills: +todayBills.rows[0].c,
      today_amount: +todayAmount.rows[0].amt,
      pending_proformas: +pendingProformas.rows[0].c,
      pending_amount: +pendingProformas.rows[0].amt,
      total_customers: +totalCustomers.rows[0].c,
      total_books: +totalBooks.rows[0].c,
      monthly_trend: monthlyBills.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
