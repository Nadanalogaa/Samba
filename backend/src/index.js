require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const rateMasterRoutes = require('./routes/rateMaster');
const customerRoutes = require('./routes/customerMaster');
const orderRoutes = require('./routes/orders');
const billRoutes = require('./routes/bills');
const reportRoutes = require('./routes/reports');
const configRoutes = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/cash/health', (_req, res) => {
  res.json({ status: 'ok', module: 'Samba Cash Bill', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/cash/auth', authRoutes);
app.use('/api/cash/rate-master', rateMasterRoutes);
app.use('/api/cash/customers', customerRoutes);
app.use('/api/cash/orders', orderRoutes);
app.use('/api/cash/bills', billRoutes);
app.use('/api/cash/reports', reportRoutes);
app.use('/api/cash/config', configRoutes);

app.listen(PORT, () => {
  console.log(`Cash Bill API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/cash/health`);
});
