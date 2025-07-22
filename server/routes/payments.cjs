"use server";
const express = require('express');
const connection = require('../database/connection.js');
const sql = connection.sql || connection;
if (typeof sql !== 'function') {
  throw new Error('sql import in payments.cjs is not a function! Check database/connection.js export and import style.');
}
console.log('sql type in payments.cjs:', typeof sql); // Should print 'function'
const { authenticateToken, requireAdmin } = require('../middleware/auth.js');

const router = express.Router();

// Submit payment request
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { email, phone, amount = 3000.00 } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    const result = await sql`
      INSERT INTO payment_submissions (user_id, email, phone, amount, status)
      VALUES (${req.user.userId}, ${email}, ${phone}, ${amount}, 'pending')
      RETURNING id, email, phone, amount, status, submitted_at
    `;

    res.status(201).json({
      message: 'Payment request submitted successfully',
      payment: result[0]
    });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ error: 'Failed to submit payment request' });
  }
});

// Get all payment submissions (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payments = await sql`
      SELECT 
        ps.id,
        ps.email,
        ps.phone,
        ps.amount,
        ps.status,
        ps.submitted_at,
        ps.approved_at,
        u.email as approved_by_email
      FROM payment_submissions ps
      LEFT JOIN users u ON ps.approved_by = u.id
      ORDER BY ps.submitted_at DESC
    `;

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Approve payment (admin only)
router.post('/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Get payment details
    const payments = await sql`
      SELECT * FROM payment_submissions WHERE id = ${paymentId}
    `;

    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = payments[0];

    // Update payment status
    await sql`
      UPDATE payment_submissions 
      SET status = 'approved', approved_at = NOW(), approved_by = ${req.user.userId}
      WHERE id = ${paymentId}
    `;

    // Grant premium access to user
    const premiumUntil = new Date();
    premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);

    await sql`
      UPDATE users 
      SET role = 'premium', status = 'active', premium_until = ${premiumUntil}
      WHERE id = ${payment.user_id}
    `;

    res.json({
      message: 'Payment approved and premium access granted',
      paymentId
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// Reject payment (admin only)
router.post('/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const result = await sql`
      UPDATE payment_submissions 
      SET status = 'rejected', approved_at = NOW(), approved_by = ${req.user.userId}
      WHERE id = ${paymentId}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      message: 'Payment rejected successfully',
      paymentId
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// Get user's payment history
router.get('/my-payments', authenticateToken, async (req, res) => {
  try {
    const payments = await sql`
      SELECT id, email, phone, amount, status, submitted_at, approved_at
      FROM payment_submissions 
      WHERE user_id = ${req.user.userId}
      ORDER BY submitted_at DESC
    `;

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router; 