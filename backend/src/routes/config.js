const { Router } = require('express');
const pool = require('../db/pool');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

// GET /api/cash/config/discounts
router.get('/discounts', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM discount_config ORDER BY type_code');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cash/config/discounts/:typeCode
router.put('/discounts/:typeCode', authenticate, requireAdmin, async (req, res) => {
  try {
    const { discount_percent, type_name, description, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE discount_config SET discount_percent=$1, type_name=$2, description=$3, is_active=$4, updated_at=NOW()
       WHERE type_code=$5 RETURNING *`,
      [discount_percent, type_name, description, is_active ?? true, req.params.typeCode]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Discount type not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/config/districts
router.get('/districts', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM districts ORDER BY code');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/config/company
router.get('/company', async (_req, res) => {
  res.json({
    name: 'SAMBA PUBLISHING COMPANY PVT LTD',
    address1: '152, Peters Road, Chennai-600 086',
    address2: 'Tamil Nadu, India',
    gstin: '33AAACS6646R1ZS',
    stateCode: '33',
    hsnCodes: ['49011010', '49030020'],
    phone: '044-28345678',
    email: 'info@sambapublications.com',
  });
});

module.exports = router;
