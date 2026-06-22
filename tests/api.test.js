// tests/api.test.js
// API Integration Tests — Phase 6 / Phase 3 (API Testing Level)
// Tool: supertest — HTTP assertions against Express app (no live server)

const request = require('supertest');

// ── Property model mock: thenable chain matching all controller patterns ─────
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
      exec:     jest.fn(function() { return Promise.resolve(val); }),
    };
  }
  return {
    find:            jest.fn(function() { return chain([]); }),
    findById:        jest.fn().mockResolvedValue(null),
    findByIdAndUpdate: jest.fn().mockResolvedValue(null),
    countDocuments:  jest.fn().mockResolvedValue(5),
  };
});

jest.mock('../models/User', () => ({
  findOne:         jest.fn().mockResolvedValue(null),
  findById:        jest.fn().mockResolvedValue(null),
  countDocuments:  jest.fn().mockResolvedValue(3),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
}));

jest.mock('../models/Review', () => ({
  find: jest.fn(function() {
    return {
      populate: jest.fn(function() {
        return { sort: jest.fn().mockResolvedValue([]) };
      }),
    };
  }),
  findOne: jest.fn().mockResolvedValue(null),
}));

jest.mock('../models/Inquiry', () =>
  jest.fn().mockImplementation(function() { return { save: jest.fn().mockResolvedValue(true) }; })
);

const app = require('./testApp');

// ── AUTH ─────────────────────────────────────────────────────────────────────

describe('GET /auth/register', () => {
  test('returns 200 with registration form', async () => {
    const res = await request(app).get('/auth/register');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/register|create account/i);
  });
});

describe('GET /auth/login', () => {
  test('returns 200 with login form', async () => {
    const res = await request(app).get('/auth/login');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/login|sign in/i);
  });
});

describe('POST /auth/register — server-side validation', () => {
  test('empty form → 200 with error', async () => {
    const res = await request(app).post('/auth/register').type('form').send({});
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/fill all fields|required/i);
  });

  test('mismatched passwords → 200 with error', async () => {
    const res = await request(app).post('/auth/register').type('form')
      .send({ name: 'Test', email: 't@m.com', password: 'abc123', password2: 'xyz789', role: 'user' });
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/passwords do not match/i);
  });

  test('password too short → 200 with error', async () => {
    const res = await request(app).post('/auth/register').type('form')
      .send({ name: 'Test', email: 't@m.com', password: '123', password2: '123', role: 'user' });
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/6 characters/i);
  });
});

describe('POST /auth/login — invalid credentials', () => {
  test('wrong credentials → 302 redirect to login', async () => {
    const res = await request(app).post('/auth/login').type('form')
      .send({ email: 'nobody@m.com', password: 'wrong' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/auth\/login/i);
  });
});

// ── PROPERTY ROUTES ──────────────────────────────────────────────────────────

describe('GET /properties', () => {
  test('public listing page always returns 200', async () => {
    expect((await request(app).get('/properties')).status).toBe(200);
  });

  test('?type=sale filter — no crash (200)', async () => {
    expect((await request(app).get('/properties?type=sale')).status).toBe(200);
  });

  test('?city=Lahore filter — no crash (200)', async () => {
    expect((await request(app).get('/properties?city=Lahore')).status).toBe(200);
  });

  test('combined filters — no crash (200)', async () => {
    expect((await request(app).get('/properties?type=rent&minPrice=5000000&maxPrice=20000000')).status).toBe(200);
  });
});

describe('GET /properties/:id — edge cases', () => {
  test('non-existent valid ObjectId → not 500', async () => {
    expect((await request(app).get('/properties/000000000000000000000000')).status).not.toBe(500);
  });

  test('malformed ID → not 500', async () => {
    expect((await request(app).get('/properties/bad-id')).status).not.toBe(500);
  });
});

describe('GET /properties/compare', () => {
  test('accessible to guests (200)', async () => {
    expect((await request(app).get('/properties/compare')).status).toBe(200);
  });

  test('empty ids param — no crash (200)', async () => {
    expect((await request(app).get('/properties/compare?ids=')).status).toBe(200);
  });
});

// ── PROTECTED ROUTES ─────────────────────────────────────────────────────────

describe('Protected routes: unauthenticated users always get 302', () => {
  ['/properties/favorites', '/agent/dashboard', '/admin/dashboard', '/agent/add-property']
    .forEach(route => {
      test(`${route} → 302`, async () => {
        expect((await request(app).get(route)).status).toBe(302);
      });
    });
});

// ── 404 HANDLER ──────────────────────────────────────────────────────────────

describe('404 handler', () => {
  test('unknown route → 404 status', async () => {
    expect((await request(app).get('/this-does-not-exist')).status).toBe(404);
  });

  test('404 page has helpful message, no stack trace', async () => {
    const res = await request(app).get('/totally-fake');
    expect(res.text).toMatch(/not found|404/i);
    expect(res.text).not.toMatch(/TypeError:|Error:/i);
  });
});

// ── BOUNDARY QUERY INPUTS ────────────────────────────────────────────────────

describe('GET /properties — boundary query inputs', () => {
  test('bedrooms=0 — no crash (200)', async () => {
    expect((await request(app).get('/properties?bedrooms=0')).status).toBe(200);
  });

  test('sort=not_valid — falls back gracefully (200)', async () => {
    expect((await request(app).get('/properties?sort=not_valid')).status).toBe(200);
  });

  test('maxPrice=999999999 — no crash (200)', async () => {
    expect((await request(app).get('/properties?maxPrice=999999999')).status).toBe(200);
  });
});
