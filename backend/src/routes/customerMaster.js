const { Router } = require('express');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /api/cash/customers - List with filter
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, district, type, active } = req.query;
    let sql = 'SELECT cm.*, dc.type_name, dc.discount_percent FROM customer_master cm LEFT JOIN discount_config dc ON cm.customer_type = dc.type_code WHERE 1=1';
    const params = [];

    // Filter by user's districts
    params.push(req.user.districts);
    sql += ` AND cm.district_code = ANY($${params.length})`;

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (cm.customer_name ILIKE $${params.length} OR cm.customer_code ILIKE $${params.length} OR cm.contact_person ILIKE $${params.length})`;
    }
    if (district) {
      params.push(district);
      sql += ` AND cm.district_code = $${params.length}`;
    }
    if (type) {
      params.push(type);
      sql += ` AND cm.customer_type = $${params.length}`;
    }
    if (active !== undefined) {
      params.push(active === 'true');
      sql += ` AND cm.is_active = $${params.length}`;
    }

    sql += ' ORDER BY cm.customer_code';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cash/customers/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT cm.*, dc.type_name, dc.discount_percent FROM customer_master cm LEFT JOIN discount_config dc ON cm.customer_type = dc.type_code WHERE cm.id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cash/customers
router.post('/', authenticate, async (req, res) => {
  try {
    const { customer_code, customer_name, address1, address2, address3, address4, pin_code, customer_type, contact_person, phone, email, district_code, bank_name, bank_address, bank_location, pay_term } = req.body;
    if (!customer_code || !customer_name || !district_code) {
      return res.status(400).json({ error: 'customer_code, customer_name, and district_code are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO customer_master (customer_code,customer_name,address1,address2,address3,address4,pin_code,customer_type,contact_person,phone,email,district_code,bank_name,bank_address,bank_location,pay_term,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [customer_code, customer_name, address1||'', address2||'', address3||'', address4||'', pin_code||'', customer_type||'D', contact_person||'', phone||'', email||'', district_code, bank_name||'', bank_address||'', bank_location||'', pay_term||'D', req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Customer code already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cash/customers/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const f = req.body;
    const { rows } = await pool.query(
      `UPDATE customer_master SET customer_name=$1,address1=$2,address2=$3,address3=$4,address4=$5,pin_code=$6,customer_type=$7,contact_person=$8,phone=$9,email=$10,bank_name=$11,bank_address=$12,bank_location=$13,pay_term=$14,is_active=$15,updated_at=NOW()
       WHERE id=$16 RETURNING *`,
      [f.customer_name, f.address1, f.address2, f.address3, f.address4, f.pin_code, f.customer_type, f.contact_person, f.phone, f.email, f.bank_name, f.bank_address, f.bank_location, f.pay_term, f.is_active ?? true, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
