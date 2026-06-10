const { Router } = require('express');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /api/cash/rate-master - List all (with search/filter)
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, standard, active } = req.query;
    let sql = 'SELECT * FROM rate_master WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (title_name ILIKE $${params.length} OR book_code ILIKE $${params.length} OR short_title ILIKE $${params.length})`;
    }
    if (standard) {
      params.push(standard);
      sql += ` AND standard = $${params.length}`;
    }
    if (active !== undefined) {
      params.push(active === 'true');
      sql += ` AND is_active = $${params.length}`;
    }

    sql += ' ORDER BY standard, book_code';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/rate-master/standards - List distinct standards
router.get('/standards', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT standard FROM rate_master ORDER BY standard');
    res.json(rows.map(r => r.standard));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/rate-master/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM rate_master WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cash/rate-master
router.post('/', authenticate, async (req, res) => {
  try {
    const { book_code, standard, title_name, short_title, rate, hsn_code } = req.body;
    if (!book_code || !standard || !title_name || !short_title || !rate) {
      return res.status(400).json({ error: 'All fields required: book_code, standard, title_name, short_title, rate' });
    }
    const { rows } = await pool.query(
      `INSERT INTO rate_master (book_code, standard, title_name, short_title, rate, hsn_code, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [book_code, standard, title_name, short_title, rate, hsn_code || '49011010', req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Book code already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cash/rate-master/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { book_code, standard, title_name, short_title, rate, hsn_code, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE rate_master SET book_code=$1, standard=$2, title_name=$3, short_title=$4, rate=$5, hsn_code=$6, is_active=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [book_code, standard, title_name, short_title, rate, hsn_code, is_active, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cash/rate-master/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('UPDATE rate_master SET is_active = false, updated_at = NOW() WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
