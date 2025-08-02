"use server";
const express = require('express');
const connection = require('../database/connection.js');
const sql = connection.sql || connection;
if (typeof sql !== 'function') {
  throw new Error('sql import in users.cjs is not a function! Check database/connection.js export and import style.');
}
console.log('sql type in users.cjs:', typeof sql); // Should print 'function'
const { authenticateToken, requireAdmin } = require('../middleware/auth.js');
const { asyncHandler, ValidationError, AuthorizationError, DatabaseError } = require('../middleware/errorHandler.js');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const users = await sql`
    SELECT id, email, phone, role, status, premium_until, created_at
    FROM users
    ORDER BY created_at DESC
  `;

  if (!users) {
    throw new DatabaseError('Failed to fetch users from database');
  }

  res.json({ users });
}));

// Grant premium access (admin only)
router.post('/grant-premium', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Set premium until 1 year from now
    const premiumUntil = new Date();
    premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);

    const result = await sql`
      UPDATE users 
      SET role = 'premium', status = 'active', premium_until = ${premiumUntil}
      WHERE id = ${userId}
      RETURNING id, email, role, status, premium_until
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Premium access granted successfully',
      user: result[0]
    });
  } catch (error) {
    console.error('Error granting premium access:', error);
    res.status(500).json({ error: 'Failed to grant premium access' });
  }
});

// Revoke premium access (admin only)
router.post('/revoke-premium', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await sql`
      UPDATE users 
      SET role = 'free', status = 'active', premium_until = NULL
      WHERE id = ${userId}
      RETURNING id, email, role, status, premium_until
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Premium access revoked successfully',
      user: result[0]
    });
  } catch (error) {
    console.error('Error revoking premium access:', error);
    res.status(500).json({ error: 'Failed to revoke premium access' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, phone, role, status, premium_until, created_at
      FROM users WHERE id = ${req.user.userId}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router; 