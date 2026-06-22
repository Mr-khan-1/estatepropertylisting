// tests/e2e.test.js
// End-to-End Flow Tests — complete user journeys across multiple HTTP requests

const request = require('supertest');

jest.mock('../models/Property', () => {
  function chain(val) {
    val = val || [];
    const p = Promise.resolve(val);
    return {
      then: p.then.bind(p),
      catch: p.catch.bind(p),
      populate: jest.fn(function() { return chain(val); }),
      sort:     jest.fn(function() { return chain(val); }),
      limit:    jest.fn(function() { return chain(val); }),
      lean:     jest.fn(function() { return Promise.resolve(val); }),
    };
  }
  return {
    find: jest.fn(function() { return chain([]); }),
    findById: jest.fn().mockResolvedValue(null),
    findByIdAndUpdate: jest.fn().mockResolvedValue(null),
    countDocuments: jest.fn().mockResolvedValue(2),
  };
});

jest.mock('../models/User', () => ({
  findOne: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  countDocuments: jest.fn().mockResolvedValue(1),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
}));

jest.mock('../models/Review', () => ({
  find: jest.fn(function() {
    return { populate: jest.fn(function() { return { sort: jest.fn().mockResolvedValue([])}; }) };
  }),
  findOne: jest.fn().mockResolvedValue(null),
}));

jest.mock('../models/Inquiry', () =>
  jest.fn().mockImplementation(function() { return { save: jest.fn().mockResolvedValue(true) }; })
);

const app = require('./testApp');

// =============================================================================
// FLOW 1: Guest browses the public platform
// =============================================================================
describe('E2E Flow 1: Guest browses public pages', () => {
  test('Step 1 — Homepage loads (200)', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/estate|property|home/i);
  });

  test('Step 2 — Properties listing loads (200)', async () => {
    expect((await request(app).get('/properties')).status).toBe(200);
  });

  test('Step 3 — Search by city (200)', async () => {
    expect((await request(app).get('/properties?city=Lahore')).status).toBe(200);
  });

  test('Step 4 — Filter by type and price range (200)', async () => {
    expect((await request(app).get('/properties?type=sale&minPrice=5000000&maxPrice=30000000')).status).toBe(200);
  });

  test('Step 5 — Compare page loads (200)', async () => {
    expect((await request(app).get('/properties/compare')).status).toBe(200);
  });

  test('Step 6 — Favorites blocked, redirect (302)', async () => {
    const res = await request(app).get('/properties/favorites');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// =============================================================================
// FLOW 2: Registration journey
// =============================================================================
describe('E2E Flow 2: Registration with validation errors', () => {
  test('Step 1 — Register page accessible (200)', async () => {
    expect((await request(app).get('/auth/register')).status).toBe(200);
  });

  test('Step 2 — Empty form → error shown (200)', async () => {
    const res = await request(app).post('/auth/register').type('form').send({});
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/fill all fields|required/i);
  });

  test('Step 3 — Mismatched passwords → error (200)', async () => {
    const res = await request(app).post('/auth/register').type('form')
      .send({ name: 'Ayesha', email: 'a@mail.com', password: 'pass123', password2: 'diff456', role: 'user' });
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/passwords do not match/i);
  });

  test('Step 4 — Short password → error (200)', async () => {
    const res = await request(app).post('/auth/register').type('form')
      .send({ name: 'Bilal', email: 'b@mail.com', password: '123', password2: '123', role: 'user' });
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/6 characters/i);
  });
});

// =============================================================================
// FLOW 3: Login failure handling
// =============================================================================
describe('E2E Flow 3: Login failure handling', () => {
  test('Step 1 — Login page accessible (200)', async () => {
    expect((await request(app).get('/auth/login')).status).toBe(200);
  });

  test('Step 2 — Wrong credentials → redirect to login (302)', async () => {
    const res = await request(app).post('/auth/login').type('form')
      .send({ email: 'fake@mail.com', password: 'wrongpass' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/auth\/login/);
  });

  test('Step 3 — Empty credentials → redirect to login (302)', async () => {
    const res = await request(app).post('/auth/login').type('form').send({ email: '', password: '' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/auth\/login/);
  });
});

// =============================================================================
// FLOW 4: Role-based access control
// =============================================================================
describe('E2E Flow 4: Agent routes blocked for guests', () => {
  ['/agent/dashboard', '/agent/add-property', '/agent/inquiries', '/agent/notifications']
    .forEach(route => {
      test(`${route} → 302`, async () => {
        expect((await request(app).get(route)).status).toBe(302);
      });
    });
});

describe('E2E Flow 4: Admin routes blocked for guests', () => {
  ['/admin/dashboard', '/admin/pending', '/admin/flagged', '/admin/properties', '/admin/users']
    .forEach(route => {
      test(`${route} → 302`, async () => {
        expect((await request(app).get(route)).status).toBe(302);
      });
    });
});

// =============================================================================
// FLOW 5: 404 handling
// =============================================================================
describe('E2E Flow 5: Unknown routes return 404', () => {
  ['/unknown', '/auth/fake', '/agent/fake', '/admin/nothing', '/props/deep/unknown']
    .forEach(route => {
      test(`${route} → 404`, async () => {
        expect((await request(app).get(route)).status).toBe(404);
      });
    });

  test('404 page: user-friendly message, no stack trace', async () => {
    const res = await request(app).get('/totally-fake');
    expect(res.text).toMatch(/not found|404/i);
    expect(res.text).not.toMatch(/TypeError:|Error:/i);
  });
});
