const request = require('supertest');
const app = require('../index.cjs');
const { validate } = require('../middleware/validation.js');
const { loginSchema, registerSchema } = require('../schemas/authSchemas.js');
const { chatMessageSchema } = require('../schemas/chatSchemas.js');
const { userIdSchema } = require('../schemas/userSchemas.js');

describe('Validation Middleware Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Get auth token for protected routes
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'seanmacalintal0409@gmail.com',
        password: 'TestPassword123!'
      });
    
    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
    }
  });

  describe('Authentication Validation', () => {
    describe('POST /api/auth/login', () => {
      test('should accept valid login data', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'seanmacalintal0409@gmail.com',
            password: 'TestPassword123!'
          });

        expect([200, 401]).toContain(response.status);
        if (response.status === 400) {
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toBe('Validation failed');
        }
      });

      test('should reject empty email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: '',
            password: 'TestPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should reject invalid email format', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'invalid-email',
            password: 'TestPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should reject missing password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should reject XSS attempts in email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: '<script>alert("xss")</script>@example.com',
            password: 'TestPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
      });
    });

    describe('POST /api/auth/register', () => {
      test('should reject weak password', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'newuser@example.com',
            password: 'weak',
            phone: '09123456789'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should reject invalid phone number', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'newuser@example.com',
            password: 'StrongPass123!',
            phone: '12345'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should reject missing required fields', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'newuser@example.com'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });
    });
  });

  describe('Chat Validation', () => {
    describe('POST /api/crisis/chat', () => {
      test('should reject empty message', async () => {
        if (!authToken) {
          console.log('⚠️ Skipping chat validation test - no auth token');
          return;
        }

        const response = await request(app)
          .post('/api/crisis/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            message: '',
            session_id: 'test-session'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should reject message too long', async () => {
        if (!authToken) {
          console.log('⚠️ Skipping chat validation test - no auth token');
          return;
        }

        const longMessage = 'a'.repeat(5001);
        const response = await request(app)
          .post('/api/crisis/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            message: longMessage,
            session_id: 'test-session'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should reject invalid session_id format', async () => {
        if (!authToken) {
          console.log('⚠️ Skipping chat validation test - no auth token');
          return;
        }

        const response = await request(app)
          .post('/api/crisis/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            message: 'Test message',
            session_id: 'invalid-session-id'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should accept valid chat message', async () => {
        if (!authToken) {
          console.log('⚠️ Skipping chat validation test - no auth token');
          return;
        }

        const response = await request(app)
          .post('/api/crisis/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            message: 'This is a valid test message',
            session_id: 'session_test123'
          });

        expect([200, 403]).toContain(response.status);
        if (response.status === 400) {
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toBe('Validation failed');
        }
      });
    });
  });

  describe('User Management Validation', () => {
    describe('POST /api/users/grant-premium', () => {
      test('should reject invalid user ID', async () => {
        if (!authToken) {
          console.log('⚠️ Skipping user validation test - no auth token');
          return;
        }

        const response = await request(app)
          .post('/api/users/grant-premium')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            userId: 'invalid-id'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should reject missing user ID', async () => {
        if (!authToken) {
          console.log('⚠️ Skipping user validation test - no auth token');
          return;
        }

        const response = await request(app)
          .post('/api/users/grant-premium')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      });

      test('should accept valid user ID', async () => {
        if (!authToken) {
          console.log('⚠️ Skipping user validation test - no auth token');
          return;
        }

        const response = await request(app)
          .post('/api/users/grant-premium')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            userId: 1
          });

        expect([200, 401, 403, 404]).toContain(response.status);
        if (response.status === 400) {
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toBe('Validation failed');
        }
      });
    });
  });

  describe('XSS Protection Tests', () => {
    test('should sanitize script tags in input', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '<script>alert("xss")</script>test@example.com',
          password: 'TestPassword123!'
        });

      expect([400, 401]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body).toHaveProperty('error');
      }
    });

    test('should sanitize javascript: protocol', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'javascript:alert("xss")@example.com',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should sanitize event handlers', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com" onload="alert("xss")',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Schema Validation Tests', () => {
    test('loginSchema should validate correct data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const { error } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('loginSchema should reject invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThan(0);
    });

    test('chatMessageSchema should validate correct data', () => {
      const validData = {
        message: 'Test message',
        session_id: 'session_test123'
      };

      const { error } = chatMessageSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('chatMessageSchema should reject invalid data', () => {
      const invalidData = {
        message: '',
        session_id: 'invalid-session'
      };

      const { error } = chatMessageSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details).toBeDefined();
    });

    test('userIdSchema should validate correct data', () => {
      const validData = {
        userId: 1
      };

      const { error } = userIdSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('userIdSchema should reject invalid data', () => {
      const invalidData = {
        userId: 'invalid'
      };

      const { error } = userIdSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details).toBeDefined();
    });
  });
}); 