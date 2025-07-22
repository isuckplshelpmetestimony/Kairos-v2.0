require('dotenv/config');
console.log('DATABASE_URL at runtime:', process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { fileURLToPath } = require('url');
const { testConnection } = require('./database/connection.js');

const authRoutes = require('./routes/auth.cjs');
const userRoutes = require('./routes/users.cjs');
const paymentRoutes = require('./routes/payments.cjs');
const crisisRoutes = require('./routes/crisis.cjs');
const crisisChatRoutes = require('./routes/crisis-chat.cjs');
const statusRoutes = require('./routes/status.cjs');

// In CommonJS, __filename and __dirname are available by default.
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
// Register crisis routes
app.use('/api/crisis', crisisRoutes);
app.use('/api/crisis', crisisChatRoutes);
app.use('/api/status', statusRoutes);

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

// Start server
const startServer = async () => {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  console.log('JWT_SECRET at runtime:', process.env.JWT_SECRET);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer(); 