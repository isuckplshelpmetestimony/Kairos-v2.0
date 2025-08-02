"use server";
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../database/connection.js');
const { asyncHandler, ValidationError, AuthenticationError, DatabaseError } = require('../middleware/errorHandler.js');
const { validate, sanitize } = require('../middleware/validation.js');
const { loginSchema, registerSchema } = require('../schemas/authSchemas.js');

// Register
router.post('/register', sanitize, validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, phone } = req.body;

  // Check if user exists
  const existingUsers = await sql`
    SELECT id FROM users WHERE email = ${email}
  `;

  if (existingUsers.length > 0) {
    throw new ValidationError('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await sql`
    INSERT INTO users (email, phone, password_hash)
    VALUES (${email}, ${phone}, ${hashedPassword})
    RETURNING id, email
  `;

  if (!newUser || newUser.length === 0) {
    throw new DatabaseError('Failed to create user account');
  }

  // Generate token
  const { config } = require('../config/index.js');
  const token = jwt.sign(
    { userId: newUser[0].id, email: newUser[0].email },
    config.security.jwtSecret,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'User created successfully',
    token,
    user: newUser[0]
  });
}));

// Login
router.post('/login', sanitize, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt for:', email); // Debug log

  // Get user - CORRECT SQL USAGE
  const users = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;

  if (users.length === 0) {
    throw new AuthenticationError('Invalid email or password');
  }

  const user = users[0];
  console.log('User object from DB:', user); // Debug log

  // Defensive: use password_hash
  if (!user.password_hash) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  console.log('Password valid:', isValidPassword); // Debug log

  if (!isValidPassword) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate token
  const { config } = require('../config/index.js');
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.security.jwtSecret,
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
}));

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
      const { config } = require('../config/index.js');
      decoded = jwt.verify(
        token, 
        config.security.jwtSecret
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