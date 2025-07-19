import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sql from '../database/connection.js';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // Validate input
    if (!email || !password || !phone) {
      return res.status(400).json({ error: 'Email, password, and phone are required' });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await sql`
      INSERT INTO users (email, phone, password_hash, role, status)
      VALUES (${email}, ${phone}, ${passwordHash}, 'free', 'active')
      RETURNING id, email, phone, role, status
    `;

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        phone: newUser[0].phone,
        role: newUser[0].role,
        status: newUser[0].status
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const users = await sql`
      SELECT id, email, phone, password_hash, role, status, premium_until
      FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        premium_until: user.premium_until
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user data
    const users = await sql`
      SELECT id, email, phone, role, status, premium_until
      FROM users WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: users[0].id,
        email: users[0].email,
        phone: users[0].phone,
        role: users[0].role,
        status: users[0].status,
        premium_until: users[0].premium_until
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router; 