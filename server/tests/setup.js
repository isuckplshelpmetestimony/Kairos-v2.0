// Test environment setup
require('dotenv/config');

// Set test environment
process.env.NODE_ENV = 'test';

// Test database configuration
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Suppress console output during tests unless explicitly needed
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

// Note: Console restoration is handled in individual test files
// as afterAll is not available in setup files

// Global test utilities
global.testUtils = {
  // Generate test user data
  createTestUser: () => ({
    email: `test-${Date.now()}@example.com`,
    password: 'StrongPass123!',
    phone: '09123456789'
  }),
  
  // Generate test auth token
  createTestToken: (userId = 1) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, email: 'test@example.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },
  
  // Clean up test data
  cleanupTestData: async (sql) => {
    try {
      // Clean up test users
      await sql`DELETE FROM users WHERE email LIKE 'test-%'`;
      // Clean up test chat conversations
      await sql`DELETE FROM crisis_chat_conversations WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test-%')`;
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  },
  
  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock request object
  createMockRequest: (data = {}) => ({
    body: data.body || {},
    query: data.query || {},
    params: data.params || {},
    headers: data.headers || {},
    user: data.user || null,
    method: data.method || 'GET',
    url: data.url || '/test',
    ...data
  }),
  
  // Mock response object
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
  }
};

// Test database connection will be handled in individual test files
// as beforeAll/afterAll are not available in setup files

// Global test configuration
global.TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  timeout: 10000,
  retries: 3
}; 