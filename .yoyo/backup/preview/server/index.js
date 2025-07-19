import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './database/connection.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import paymentRoutes from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

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

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer(); 