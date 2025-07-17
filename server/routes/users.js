const express = require('express');
const { sql } = require('../database/connection');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, phone, role, status, premium_until, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Grant premium access (admin only)
router.post('/:userId/grant-premium', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const updatedUser = await sql`
      UPDATE users
      SET role = 'premium', status = 'active', premium_until = ${premiumUntil}
      WHERE id = ${userId}
      RETURNING id, email, phone, role, status, premium_until
    `;

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error granting premium:', error);
    res.status(500).json({ error: 'Failed to grant premium access' });
  }
});

// Revoke premium access (admin only)
router.post('/:userId/revoke-premium', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedUser = await sql`
      UPDATE users
      SET role = 'free', premium_until = NULL
      WHERE id = ${userId}
      RETURNING id, email, phone, role, status, premium_until
    `;

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error revoking premium:', error);
    res.status(500).json({ error: 'Failed to revoke premium access' });
  }
});

module.exports = router;
