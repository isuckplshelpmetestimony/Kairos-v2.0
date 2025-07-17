const jwt = require('jsonwebtoken');
const { sql } = require('../database/connection');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await sql`
      SELECT id, email, phone, role, status
      FROM users
      WHERE id = ${decoded.userId}
    `;

    if (user.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
