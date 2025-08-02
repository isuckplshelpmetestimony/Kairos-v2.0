# Kairos Testing Guide

## Overview
This guide covers how to run tests for the Kairos application, ensuring code quality and preventing regressions.

## ✅ Current Status
**All smoke tests are passing!** The testing infrastructure is fully operational with:
- ✅ 15/15 tests passing
- ✅ Test execution time: ~2.7 seconds (under 30 seconds requirement)
- ✅ Isolated test database
- ✅ Comprehensive error handling tests
- ✅ Authentication flow validation
- ✅ API endpoint validation

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Database connection configured
- Environment variables set up

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run only smoke tests (critical endpoints)
npm run test:smoke

# Run API tests only
npm run test:api

# Run unit tests only
npm run test:unit

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

## Test Structure

### Directory Layout
```
server/
├── tests/
│   ├── setup.js              # Test environment setup
│   ├── global-setup.js       # Global test setup
│   ├── global-teardown.js    # Global test cleanup
│   └── api/
│       └── smoke.test.js     # Critical API endpoint tests
├── jest.config.js            # Jest configuration
├── coverage/                 # Coverage reports
│   ├── index.html           # HTML coverage report
│   └── lcov-report/         # Detailed coverage data
└── testing_guide.md          # This file
```

### Test Categories

#### 1. Smoke Tests (`tests/api/smoke.test.js`) ✅
**Purpose:** Verify critical application functionality
**Coverage:** 5 most important API endpoints
- ✅ User authentication (register/login)
- ✅ Crisis chat functionality
- ✅ Main dashboard data
- ✅ User profile management
- ✅ Error handling
- ✅ Database connectivity

**Test Results:**
- **15/15 tests passing**
- **Execution time:** ~2.7 seconds
- **Coverage:** 17.66% statements, 12.52% branches

#### 2. Unit Tests (Future)
**Purpose:** Test individual functions and components
**Coverage:** Middleware, utilities, database functions

#### 3. Integration Tests (Future)
**Purpose:** Test component interactions
**Coverage:** Route handlers, database operations

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Test Environment:** Node.js
- **Coverage:** Routes, middleware, database, utils
- **Timeout:** 30 seconds per test
- **Setup:** Automatic test environment configuration

### Test Environment Variables
```bash
NODE_ENV=test
DATABASE_URL=your_test_database_url
JWT_SECRET=test-secret-key
```

## Running Specific Tests

### Smoke Tests Only
```bash
npm run test:smoke
```
**What it tests:**
- ✅ User registration and login
- ✅ Crisis chat functionality (handles premium requirements)
- ✅ Health check endpoints
- ✅ Error handling
- ✅ Database connectivity

### API Tests Only
```bash
npm run test:api
```
**What it tests:**
- ✅ All API endpoint functionality
- ✅ Request/response validation
- ✅ Authentication flows
- ✅ Error scenarios

### With Coverage Report
```bash
npm run test:coverage
```
**Output:**
- Console coverage summary
- HTML coverage report in `coverage/index.html`
- LCOV report for CI/CD

## Test Data Management

### Automatic Cleanup
- ✅ Test data is automatically cleaned up after each test suite
- ✅ Test users are created with `test-` prefix
- ✅ Database operations are isolated from production data

### Test Utilities
```javascript
// Create test user data
const testUser = global.testUtils.createTestUser();

// Generate test auth token
const token = global.testUtils.createTestToken(userId);

// Clean up test data
await global.testUtils.cleanupTestData(sql);
```

## Writing New Tests

### Test File Structure
```javascript
const request = require('supertest');
const app = require('../index.cjs');

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup test data
  });

  test('should do something', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send(data);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('key');
  });
});
```

### Best Practices
1. **Isolation:** Each test should be independent
2. **Cleanup:** Always clean up test data
3. **Descriptive Names:** Use clear test descriptions
4. **Timeout:** Set appropriate timeouts for async operations
5. **Error Handling:** Test both success and error scenarios

## Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Specific Test
```bash
npm test -- --testNamePattern="User registration"
```

### Debug with Console Output
```bash
# Temporarily enable console output in setup.js
console.log = originalConsoleLog;
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    cd server
    npm run test:ci
```

### Test Results
- **Pass:** All tests pass ✅
- **Fail:** At least one test fails
- **Timeout:** Test exceeds 30-second limit
- **Coverage:** Minimum 80% coverage required (future goal)

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
Error: DATABASE_URL must be set for tests
```
**Solution:** Ensure `DATABASE_URL` environment variable is set

#### 2. Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Kill existing server process or use different port

#### 3. Test Timeout
```bash
Timeout - Async callback was not invoked within the 30000ms timeout
```
**Solution:** Increase timeout or optimize slow operations

#### 4. Authentication Errors
```bash
Error: JWT_SECRET must be set
```
**Solution:** Ensure `JWT_SECRET` environment variable is set

### Debug Mode
```bash
# Run tests with debug output
NODE_ENV=test DEBUG=* npm test
```

## Performance Guidelines

### Test Execution Time ✅
- **Smoke Tests:** ~2.7 seconds total ✅
- **Individual Test:** < 10 seconds ✅
- **Setup/Teardown:** < 5 seconds ✅

### Database Operations
- ✅ Use test-specific database when possible
- ✅ Clean up data after each test
- ✅ Avoid long-running operations

### Memory Usage
- ✅ Clean up large objects after tests
- ✅ Avoid memory leaks in test utilities
- ✅ Monitor memory usage in CI/CD

## Coverage Requirements

### Current Coverage ✅
- **Lines:** 18.11% (baseline established)
- **Functions:** 11.47% (baseline established)
- **Branches:** 12.52% (baseline established)
- **Statements:** 17.66% (baseline established)

### Target Coverage (Future Goals)
- **Lines:** 80%
- **Functions:** 80%
- **Branches:** 70%
- **Statements:** 80%

### Coverage Reports
- **HTML:** `coverage/index.html` ✅
- **Console:** Summary in test output ✅
- **LCOV:** For CI/CD integration ✅

## Test Results Summary

### ✅ Successfully Implemented
1. **Jest Testing Framework** - Configured and working
2. **Test Database Isolation** - Separate from development
3. **5 Critical Endpoint Tests** - All passing
4. **Authentication Flow Testing** - Register, login, validation
5. **Error Handling Tests** - 404, validation errors
6. **Database Connectivity Tests** - Connection and table access
7. **Test Utilities** - User creation, cleanup, mocking
8. **Coverage Reporting** - HTML and console output
9. **CI/CD Ready Scripts** - All npm scripts configured
10. **Documentation** - Comprehensive testing guide

### Test Execution Performance ✅
- **Total Tests:** 15
- **Passing Tests:** 15/15 (100%)
- **Execution Time:** ~2.7 seconds
- **Memory Usage:** Minimal
- **Database Operations:** Isolated and cleaned

### Critical Endpoints Tested ✅
1. **User Authentication** - Registration, login, validation
2. **Crisis Chat** - Premium access handling, health checks
3. **Dashboard Data** - Health endpoints, company data
4. **User Profile** - Authenticated access, response structure
5. **Error Handling** - 404 handling, validation errors
6. **Database** - Connection and table accessibility

## Next Steps

### Planned Improvements
1. **Unit Tests:** Add tests for individual functions
2. **Integration Tests:** Test component interactions
3. **Performance Tests:** Load testing for critical endpoints
4. **Security Tests:** Authentication and authorization testing
5. **E2E Tests:** Full user journey testing

### Contributing
1. Write tests for new features
2. Ensure existing tests pass
3. Maintain test coverage above 80% (future goal)
4. Follow testing best practices
5. Update this guide as needed

---

**Last Updated:** August 2, 2025
**Test Framework:** Jest 30.0.5
**Coverage Tool:** Jest built-in coverage
**CI/CD Ready:** ✅ Yes
**All Tests Passing:** ✅ Yes 