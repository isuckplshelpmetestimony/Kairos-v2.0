const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbModule = require('../database/connection.js');
console.log('dbModule:', dbModule);
const { sql } = dbModule;
console.log('sql type in auth.cjs:', typeof sql); // Should print 'function' 

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email); // Debug log

    // Get user - CORRECT SQL USAGE
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    console.log('User query result:', users);

    if (users.length === 0) {
      console.log('No user found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    console.log('User found:', user.email); // Debug log

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword); // Debug log

    if (!isValidPassword) {
      console.log('Password mismatch for user:', user.email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', user.email);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        premiumStatus: user.premium_status || 'none'
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}); 