// tests/setup.js — Shared test setup for API and E2E tests
// Sets required environment variables before any module is loaded

process.env.SESSION_SECRET = 'test_secret_key_for_jest';
process.env.MONGODB_URI = 'mongodb://localhost:27017/estate_test';
process.env.PORT = '0';
