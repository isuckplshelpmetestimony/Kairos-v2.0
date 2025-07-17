const express = require('express');
const { sql } = require('../database/connection');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Submit payment request
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.id;

    // Check if user already has pending payment
    const existingPayment = await sql`
      SELECT id FROM payment_submissions
      WHERE user_id = ${userId} AND status = 'pending'
    `;

    if (existingPayment.length > 0) {
      return res.status(400).json({ error: 'Payment already submitted' });
    }

    // Create payment submission
    const newPayment = await sql`
      INSERT INTO payment_submissions (user_id, email, phone)
      VALUES (${userId}, ${email}, ${phone})
      RETURNING id, email, phone, amount, status, submitted_at
    `;

    res.status(201).json(newPayment[0]);
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ error: 'Failed to submit payment' });
  }
});

// Get all payment submissions (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const payments = await sql`
      SELECT ps.*, u.email as user_email, u.phone as user_phone
      FROM payment_submissions ps
      JOIN users u ON ps.user_id = u.id
      ORDER BY ps.submitted_at DESC
    `;

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Approve payment (admin only)
router.post('/:paymentId/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const adminId = req.user.id;

    // Update payment status
    await sql`
      UPDATE payment_submissions
      SET status = 'approved', approved_at = NOW(), approved_by = ${adminId}
      WHERE id = ${paymentId}
    `;

    // Get payment details
    const payment = await sql`
      SELECT user_id FROM payment_submissions WHERE id = ${paymentId}
    `;

    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Grant premium access
    const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sql`
      UPDATE users
      SET role = 'premium', status = 'active', premium_until = ${premiumUntil}
      WHERE id = ${payment[0].user_id}
    `;

    res.json({ message: 'Payment approved and premium access granted' });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

module.exports = router;
