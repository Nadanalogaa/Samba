const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function requireDistrict(districtCode) {
  return (req, res, next) => {
    if (!req.user.districts.includes(districtCode)) {
      return res.status(403).json({ error: `No access to district ${districtCode}` });
    }
    next();
  };
}

module.exports = { authenticate, requireAdmin, requireDistrict };
