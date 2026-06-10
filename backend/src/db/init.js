const pool = require('./pool');

const SQL = `
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS cash_bill_items CASCADE;
DROP TABLE IF EXISTS cash_bills CASCADE;
DROP TABLE IF EXISTS cash_order_items CASCADE;
DROP TABLE IF EXISTS cash_orders CASCADE;
DROP TABLE IF EXISTS rate_master CASCADE;
DROP TABLE IF EXISTS customer_master CASCADE;
DROP TABLE IF EXISTS discount_config CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS cash_users CASCADE;
DROP TABLE IF EXISTS bill_sequences CASCADE;

-- Districts
CREATE TABLE districts (
  code VARCHAR(4) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  address_line1 VARCHAR(100),
  address_line2 VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discount configuration (A/B/C/D types with configurable percentages)
CREATE TABLE discount_config (
  id SERIAL PRIMARY KEY,
  type_code VARCHAR(1) NOT NULL UNIQUE,
  type_name VARCHAR(30) NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  description VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash Bill Users (separate auth from main app)
CREATE TABLE cash_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  districts VARCHAR(4)[] NOT NULL DEFAULT '{}',
  role VARCHAR(20) NOT NULL DEFAULT 'operator',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Master (Book pricing)
CREATE TABLE rate_master (
  id SERIAL PRIMARY KEY,
  book_code VARCHAR(10) NOT NULL UNIQUE,
  standard VARCHAR(10) NOT NULL,
  title_name VARCHAR(100) NOT NULL,
  short_title VARCHAR(20) NOT NULL,
  rate NUMERIC(8,2) NOT NULL,
  hsn_code VARCHAR(20) DEFAULT '49011010',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES cash_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Master
CREATE TABLE customer_master (
  id SERIAL PRIMARY KEY,
  customer_code VARCHAR(10) NOT NULL UNIQUE,
  customer_name VARCHAR(100) NOT NULL,
  address1 VARCHAR(100),
  address2 VARCHAR(100),
  address3 VARCHAR(100),
  address4 VARCHAR(100),
  pin_code VARCHAR(10),
  customer_type VARCHAR(1) NOT NULL DEFAULT 'D' REFERENCES discount_config(type_code),
  contact_person VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  district_code VARCHAR(4) NOT NULL REFERENCES districts(code),
  bank_name VARCHAR(50),
  bank_address VARCHAR(100),
  bank_location VARCHAR(50),
  pay_term VARCHAR(1) DEFAULT 'D',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES cash_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash Orders (Proforma / Cash Bill header)
CREATE TABLE cash_orders (
  id SERIAL PRIMARY KEY,
  order_no VARCHAR(20) NOT NULL UNIQUE,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id INTEGER REFERENCES customer_master(id),
  contact_person VARCHAR(50),
  contact_mobile VARCHAR(20),
  walk_in_name VARCHAR(100),
  walk_in_address1 VARCHAR(100),
  walk_in_address2 VARCHAR(100),
  walk_in_pin VARCHAR(10),
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_qty INTEGER NOT NULL DEFAULT 0,
  district_code VARCHAR(4) NOT NULL REFERENCES districts(code),
  status VARCHAR(20) NOT NULL DEFAULT 'proforma',
  notes TEXT,
  created_by INTEGER REFERENCES cash_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash Order Items (line items)
CREATE TABLE cash_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES cash_orders(id) ON DELETE CASCADE,
  sl_no INTEGER NOT NULL,
  book_id INTEGER NOT NULL REFERENCES rate_master(id),
  qty INTEGER NOT NULL,
  rate NUMERIC(8,2) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill sequence tracking per district
CREATE TABLE bill_sequences (
  district_code VARCHAR(4) PRIMARY KEY REFERENCES districts(code),
  last_bill_no INTEGER NOT NULL DEFAULT 0,
  last_proforma_no INTEGER NOT NULL DEFAULT 0,
  financial_year VARCHAR(10) NOT NULL DEFAULT '2026-27'
);

-- Cash Bills (generated from orders)
CREATE TABLE cash_bills (
  id SERIAL PRIMARY KEY,
  bill_no VARCHAR(30) NOT NULL UNIQUE,
  order_id INTEGER NOT NULL REFERENCES cash_orders(id),
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  district_code VARCHAR(4) NOT NULL REFERENCES districts(code),
  net_amount NUMERIC(10,2) NOT NULL,
  printed_at TIMESTAMPTZ,
  print_count INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES cash_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_rate_master_standard ON rate_master(standard);
CREATE INDEX idx_customer_district ON customer_master(district_code);
CREATE INDEX idx_orders_district ON cash_orders(district_code);
CREATE INDEX idx_orders_date ON cash_orders(order_date);
CREATE INDEX idx_orders_status ON cash_orders(status);
CREATE INDEX idx_bills_district ON cash_bills(district_code);
CREATE INDEX idx_bills_date ON cash_bills(bill_date);
`;

async function init() {
  try {
    await pool.query(SQL);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database init failed:', err.message);
  } finally {
    await pool.end();
  }
}

init();
