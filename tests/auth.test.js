// tests/auth.test.js
// Unit tests for user registration input validation
// Oracle: validateRegistration() must return { valid: true } for correct input
//         and { valid: false, error: <reason> } for any invalid input.

const { validateRegistration } = require('../utils/validators');

describe('User Registration Validation', () => {

  // ─── NORMAL CASES ────────────────────────────────────────────────────────────

  test('valid registration with all correct fields returns valid', () => {
    const result = validateRegistration({
      name: 'Ayesha Khan',
      email: 'ayesha@example.com',
      password: 'secret123',
      role: 'user',
    });
    // Oracle: all fields correct → system must accept the input
    expect(result.valid).toBe(true);
  });

  test('valid agent registration is accepted', () => {
    const result = validateRegistration({
      name: 'Bilal Ahmed',
      email: 'bilal@zameen.com',
      password: 'agentpass1',
      role: 'agent',
    });
    expect(result.valid).toBe(true);
  });

  test('role field is optional — omitting it is still valid', () => {
    const result = validateRegistration({
      name: 'Usman',
      email: 'usman@mail.com',
      password: 'pass123',
    });
    // Oracle: role defaults to 'user', omitting it should not break validation
    expect(result.valid).toBe(true);
  });

  // ─── BOUNDARY CASES ──────────────────────────────────────────────────────────

  test('name with exactly 2 characters is accepted (minimum boundary)', () => {
    const result = validateRegistration({
      name: 'Ali',
      email: 'ali@mail.com',
      password: 'pass123',
    });
    expect(result.valid).toBe(true);
  });

  test('password with exactly 6 characters is accepted (minimum boundary)', () => {
    const result = validateRegistration({
      name: 'Dania',
      email: 'dania@mail.com',
      password: '123456',
    });
    expect(result.valid).toBe(true);
  });

  // ─── INVALID INPUT (NEGATIVE) CASES ──────────────────────────────────────────

  test('missing name returns error', () => {
    const result = validateRegistration({
      email: 'test@mail.com',
      password: 'pass123',
    });
    // Oracle: name is mandatory — system must reject and explain
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/name/i);
  });

  test('name too short (1 character) returns error', () => {
    const result = validateRegistration({
      name: 'A',
      email: 'a@mail.com',
      password: 'pass123',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/name/i);
  });

  test('invalid email format returns error', () => {
    const result = validateRegistration({
      name: 'Fatima',
      email: 'not-an-email',
      password: 'pass123',
    });
    // Oracle: broken email → user cannot be contacted or identified
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/email/i);
  });

  test('missing email returns error', () => {
    const result = validateRegistration({
      name: 'Fatima',
      password: 'pass123',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/email/i);
  });

  test('password shorter than 6 characters returns error', () => {
    const result = validateRegistration({
      name: 'Faisal',
      email: 'faisal@mail.com',
      password: '123',
    });
    // Oracle: weak passwords must be rejected before reaching DB
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/password/i);
  });

  test('missing password returns error', () => {
    const result = validateRegistration({
      name: 'Gulnaz',
      email: 'gulnaz@mail.com',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/password/i);
  });

  test('invalid role value returns error', () => {
    const result = validateRegistration({
      name: 'Hamza',
      email: 'hamza@mail.com',
      password: 'pass123',
      role: 'superuser', // not allowed
    });
    // Oracle: only predefined roles are permitted — reject unknown roles
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/role/i);
  });

  test('empty string email returns error', () => {
    const result = validateRegistration({
      name: 'Iqra',
      email: '',
      password: 'pass123',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/email/i);
  });
});
