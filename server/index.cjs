require('dotenv/config');
console.log('DATABASE_URL at runtime:', process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { fileURLToPath } = require('url');
const { testConnection } = require('./database/connection.js');
const helmet = require('helmet');
const session = require('express-session');

// Import anti-scraping middleware
// const { 
//   antiScrapingMiddleware, 
//   apiRateLimiter, 
//   authRateLimiter, 
//   chatRateLimiter 
// } = require('./middleware/anti-scraping.js');

const authRoutes = require('./routes/auth.cjs');
const userRoutes = require('./routes/users.cjs');
const paymentRoutes = require('./routes/payments.cjs');
const crisisRoutes = require('./routes/crisis.cjs');
const crisisChatRoutes = require('./routes/crisis-chat.cjs');
const statusRoutes = require('./routes/status.cjs');

// Import error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.js');

// In CommonJS, __filename and __dirname are available by default.
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - MUST BE FIRST
app.use(cors({
  origin: ['http://localhost:5173', 'https://kairos-v2-0.onrender.com'],
  credentials: true
}));

// Security middleware
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       imgSrc: ["'self'", "data:", "https:"],
//       connectSrc: ["'self'"],
//       fontSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"]
//     }
//   },
//   hsts: {
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true
//   }
// }));

// Session configuration for rate limiting
app.use(session({
  secret: process.env.SESSION_SECRET || 'kairos-anti-scraping-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Anti-scraping middleware (applied to all routes)
// app.use(antiScrapingMiddleware);

// Request logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes with specific rate limiting
app.use('/api/auth', /* authRateLimiter, */ authRoutes);
app.use('/api/users', /* apiRateLimiter, */ userRoutes);
app.use('/api/payments', /* apiRateLimiter, */ paymentRoutes);
app.use('/api/crisis', /* apiRateLimiter, */ crisisRoutes);
app.use('/api/crisis/chat', /* chatRateLimiter, */ crisisChatRoutes);
app.use('/api/status', /* apiRateLimiter, */ statusRoutes);

// Add this debug logging
console.log('🔍 Registered routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`  ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    console.log(`  Router middleware: ${middleware.regexp}`);
    if (middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(`    ${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date().toISOString() });
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 404 handler for unmatched routes (must be before error handler)
app.use(notFoundHandler);

// Centralized error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  console.log('JWT_SECRET at runtime:', process.env.JWT_SECRET);
  console.log('🛡️ Anti-scraping protection enabled');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🛡️ Security features: Helmet, Rate Limiting, Bot Detection, CORS`);
  });
};

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
  startServer();
}

// Export app for testing
module.exports = app; 