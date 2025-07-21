import jwt from 'jsonwebtoken';
import sql from '../database/connection.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
    } catch (err) {
      console.log('JWT verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    // Verify user still exists
    const users = await sql`
      SELECT id, email, role FROM users WHERE id = ${decoded.userId}
    `;
    console.log('User lookup result:', users);

    if (users.length === 0) {
      console.log('User not found for id:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: users[0].role
    };
    console.log('Authenticated user:', req.user);

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

export const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user is premium or admin
  if (req.user.role !== 'premium' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Premium access required' });
  }

  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}; 