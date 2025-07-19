import express from 'express';
import sql from '../database/connection.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, phone, role, status, premium_until, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

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

export default router; 