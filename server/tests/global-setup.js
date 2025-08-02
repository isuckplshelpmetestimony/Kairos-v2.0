// Global test setup - runs once before all tests
require('dotenv/config');

module.exports = async () => {
  console.log('🚀 Starting global test setup...');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Ensure test database URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set for tests');
  }
  
  console.log('✅ Global test setup completed');
}; 