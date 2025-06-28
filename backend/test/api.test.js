const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Test configuration
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'testpass123',
  role: 'student'
};

let authToken = '';
let userId = '';

describe('RG Publication API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/rg-publication-test';
    await mongoose.connect(testDbUri);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe('Health Check', () => {
    test('GET /health should return API status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('RG Publication API is running');
    });
  });

  describe('Authentication', () => {
    test('POST /api/v1/auth/register should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      
      authToken = response.body.data.tokens.accessToken;
      userId = response.body.data.user.id;
    });

    test('POST /api/v1/auth/login should authenticate user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    test('POST /api/v1/auth/login should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Products', () => {
    test('GET /api/v1/products should return products list', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    test('GET /api/v1/products/featured should return featured products', async () => {
      const response = await request(app)
        .get('/api/v1/products/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('bestsellers');
      expect(response.body.data).toHaveProperty('trending');
      expect(response.body.data).toHaveProperty('newArrivals');
    });

    test('GET /api/v1/products with filters should work', async () => {
      const response = await request(app)
        .get('/api/v1/products?subject=Mathematics&class=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
    });
  });

  describe('Search', () => {
    test('GET /api/v1/search/products should return search results', async () => {
      const response = await request(app)
        .get('/api/v1/search/products?q=mathematics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toBeDefined();
      expect(response.body.data.searchTime).toBeDefined();
    });

    test('GET /api/v1/search/suggestions should return suggestions', async () => {
      const response = await request(app)
        .get('/api/v1/search/suggestions?q=math')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeDefined();
    });
  });

  describe('Cart (Authenticated)', () => {
    test('GET /api/v1/cart should return user cart', async () => {
      const response = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart).toBeDefined();
    });

    test('POST /api/v1/cart/items should add item to cart', async () => {
      // First, get a product ID
      const productsResponse = await request(app)
        .get('/api/v1/products?limit=1');
      
      if (productsResponse.body.data.products.length > 0) {
        const productId = productsResponse.body.data.products[0].id;
        
        const response = await request(app)
          .post('/api/v1/cart/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId,
            quantity: 2
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.cartItem).toBeDefined();
      }
    });
  });

  describe('Contact Form', () => {
    test('POST /api/v1/contact/submit should submit contact form', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Inquiry',
        message: 'This is a test message',
        type: 'general'
      };

      const response = await request(app)
        .post('/api/v1/contact/submit')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.submission).toBeDefined();
    });

    test('POST /api/v1/contact/submit should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/contact/submit')
        .send({
          name: 'John Doe'
          // Missing required fields
        })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('Error Handling', () => {
    test('GET /api/v1/nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });

    test('Protected routes should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/cart')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('AUTHENTICATION_REQUIRED');
    });
  });
});

module.exports = {
  testUser,
  authToken,
  userId
};
