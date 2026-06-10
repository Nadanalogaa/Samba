const { Pool } = require('pg');
require('dotenv').config();

// Neon / Render / Heroku require SSL. Local dev doesn't.
const needsSSL = process.env.DATABASE_URL?.includes('sslmode=require')
  || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
