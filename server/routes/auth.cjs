"use server";
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../database/connection.js');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await sql`
      INSERT INTO users (email, password)
      VALUES (${email}, ${hashedPassword})
      RETURNING id, email
    `;

    // Generate token
    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email); // Debug log

    // Get user - CORRECT SQL USAGE
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    console.log('User object from DB:', user); // Debug log

    // Defensive: use password_hash
    if (!user.password_hash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword); // Debug log

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

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

// Verify token
router.get('/verify', async (req, res) => {
  try {
    console.log('Auth header:', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
      );
      console.log('Decoded token:', decoded);
    } catch (err) {
      console.log('JWT verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Get fresh user data
    const users = await sql`
      SELECT id, email, role, status
      FROM users 
      WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      console.log('User not found for id:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ 
      valid: true, 
      user: {
        id: users[0].id,
        email: users[0].email,
        role: users[0].role,
        status: users[0].status
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router; 