module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.cjs',
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.cjs'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'routes/**/*.js',
    'routes/**/*.cjs',
    'middleware/**/*.js',
    'middleware/**/*.cjs',
    'database/**/*.js',
    'utils/**/*.js',
    'utils/**/*.cjs',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Coverage reporters
  coverageReporters: ['text', 'html', 'lcov'],
  coverageDirectory: 'coverage',
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Test environment variables
  setupFiles: ['<rootDir>/tests/setup.js'],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'cjs', 'json'],
  
  // Transform configuration
  transform: {},
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/logs/',
    '/firecrawl/'
  ],
  
  // Global test timeout
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js'
}; 