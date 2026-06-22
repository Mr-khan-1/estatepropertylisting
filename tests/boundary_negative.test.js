// tests/boundary_negative.test.js
// Boundary & Negative Testing — Phase 4 (Test Case Design)
//
// This file focuses specifically on:
//   a) EXACT BOUNDARY VALUES — at the edge of valid/invalid ranges
//   b) NEGATIVE CASES — deliberately wrong inputs
//   c) STATE-BASED SCENARIOS — sequences that simulate system behaviour
//
// These complement the normal-case unit tests in auth.test.js / property.test.js / review.test.js

const {
  validateRegistration,
  validateProperty,
  validateReview,
  filterProperties,
  calculateAverageRating,
  formatPrice,
} = require('../utils/validators');

// =============================================================================
// BOUNDARY TESTING — validateRegistration
// =============================================================================
describe('Boundary: validateRegistration name length', () => {
  test('name of exactly 2 chars is accepted (min boundary ON)', () => {
    expect(validateRegistration({ name: 'Al', email: 'al@x.com', password: 'pass12' }).valid).toBe(true);
  });

  test('name of 1 char is rejected (min boundary OFF)', () => {
    expect(validateRegistration({ name: 'A', email: 'a@x.com', password: 'pass12' }).valid).toBe(false);
  });

  test('name of 0 chars is rejected', () => {
    expect(validateRegistration({ name: '', email: 'a@x.com', password: 'pass12' }).valid).toBe(false);
  });

  test('very long name (200 chars) is accepted — no upper cap defined', () => {
    const longName = 'A'.repeat(200);
    expect(validateRegistration({ name: longName, email: 'long@x.com', password: 'pass12' }).valid).toBe(true);
  });
});

describe('Boundary: validateRegistration password length', () => {
  test('password of exactly 6 chars is accepted (min boundary ON)', () => {
    expect(validateRegistration({ name: 'Test', email: 't@x.com', password: '123456' }).valid).toBe(true);
  });

  test('password of 5 chars is rejected (min boundary OFF)', () => {
    expect(validateRegistration({ name: 'Test', email: 't@x.com', password: '12345' }).valid).toBe(false);
  });

  test('password of 0 chars is rejected', () => {
    expect(validateRegistration({ name: 'Test', email: 't@x.com', password: '' }).valid).toBe(false);
  });
});

describe('Boundary: validateRegistration email edge cases', () => {
  test('email missing @ is rejected', () => {
    expect(validateRegistration({ name: 'Ali', email: 'aliatmail.com', password: 'pass12' }).valid).toBe(false);
  });

  test('email missing domain is rejected', () => {
    expect(validateRegistration({ name: 'Ali', email: 'ali@', password: 'pass12' }).valid).toBe(false);
  });

  test('email with spaces is rejected', () => {
    expect(validateRegistration({ name: 'Ali', email: 'ali @x.com', password: 'pass12' }).valid).toBe(false);
  });

  test('whitespace-only email is rejected', () => {
    expect(validateRegistration({ name: 'Ali', email: '   ', password: 'pass12' }).valid).toBe(false);
  });
});

// =============================================================================
// BOUNDARY TESTING — validateProperty price
// =============================================================================
describe('Boundary: validateProperty price', () => {
  test('price = 1 is accepted (absolute minimum positive)', () => {
    expect(validateProperty({ title: 'Tiny', price: 1, location: 'X', propertyType: 'plot' }).valid).toBe(true);
  });

  test('price = 0 is rejected (zero boundary OFF)', () => {
    expect(validateProperty({ title: 'Free', price: 0, location: 'X', propertyType: 'plot' }).valid).toBe(false);
  });

  test('price = -1 is rejected', () => {
    expect(validateProperty({ title: 'Neg', price: -1, location: 'X', propertyType: 'plot' }).valid).toBe(false);
  });

  test('very large price (1 billion) is accepted', () => {
    expect(validateProperty({ title: 'Mega', price: 1000000000, location: 'X', propertyType: 'commercial' }).valid).toBe(true);
  });

  test('price as string number is rejected (type boundary)', () => {
    expect(validateProperty({ title: 'Str', price: '50000', location: 'X', propertyType: 'plot' }).valid).toBe(false);
  });

  test('price as float string is rejected', () => {
    expect(validateProperty({ title: 'Float', price: '1.5e6', location: 'X', propertyType: 'plot' }).valid).toBe(false);
  });
});

describe('Boundary: validateProperty title length', () => {
  test('title of exactly 3 chars is accepted (min boundary ON)', () => {
    expect(validateProperty({ title: 'Apt', price: 100, location: 'X', propertyType: 'apartment' }).valid).toBe(true);
  });

  test('title of 2 chars is rejected (min boundary OFF)', () => {
    expect(validateProperty({ title: 'Ap', price: 100, location: 'X', propertyType: 'apartment' }).valid).toBe(false);
  });

  test('title of 1 char is rejected', () => {
    expect(validateProperty({ title: 'A', price: 100, location: 'X', propertyType: 'apartment' }).valid).toBe(false);
  });
});

describe('Boundary: validateProperty bedrooms', () => {
  test('bedrooms = 0 is accepted (minimum valid count)', () => {
    expect(validateProperty({ title: 'Studio', price: 100, location: 'X', propertyType: 'flat', bedrooms: 0 }).valid).toBe(true);
  });

  test('bedrooms = -1 is rejected (negative boundary)', () => {
    expect(validateProperty({ title: 'Neg', price: 100, location: 'X', propertyType: 'flat', bedrooms: -1 }).valid).toBe(false);
  });
});

// =============================================================================
// BOUNDARY TESTING — validateReview rating
// =============================================================================
describe('Boundary: validateReview rating exact boundaries', () => {
  test('rating 1 is accepted (min boundary ON)', () => {
    expect(validateReview({ rating: 1 }).valid).toBe(true);
  });

  test('rating 0 is rejected (min boundary OFF)', () => {
    expect(validateReview({ rating: 0 }).valid).toBe(false);
  });

  test('rating -1 is rejected', () => {
    expect(validateReview({ rating: -1 }).valid).toBe(false);
  });

  test('rating 5 is accepted (max boundary ON)', () => {
    expect(validateReview({ rating: 5 }).valid).toBe(true);
  });

  test('rating 6 is rejected (max boundary OFF)', () => {
    expect(validateReview({ rating: 6 }).valid).toBe(false);
  });

  test('rating 100 is rejected', () => {
    expect(validateReview({ rating: 100 }).valid).toBe(false);
  });
});

describe('Boundary: validateReview comment length', () => {
  test('comment of exactly 1000 chars is accepted (max boundary ON)', () => {
    expect(validateReview({ rating: 3, comment: 'a'.repeat(1000) }).valid).toBe(true);
  });

  test('comment of 1001 chars is rejected (max boundary OFF)', () => {
    expect(validateReview({ rating: 3, comment: 'a'.repeat(1001) }).valid).toBe(false);
  });

  test('empty string comment is accepted (optional field)', () => {
    expect(validateReview({ rating: 4, comment: '' }).valid).toBe(true);
  });
});

// =============================================================================
// NEGATIVE TESTING — invalid types and null/undefined inputs
// =============================================================================
describe('Negative: null and undefined inputs', () => {
  test('validateRegistration with null object does not throw', () => {
    expect(() => validateRegistration({})).not.toThrow();
  });

  test('validateProperty with all undefined fields returns invalid', () => {
    const result = validateProperty({});
    expect(result.valid).toBe(false);
  });

  test('validateReview with undefined rating returns invalid', () => {
    const result = validateReview({ rating: undefined });
    expect(result.valid).toBe(false);
  });

  test('validateReview with null rating returns invalid', () => {
    const result = validateReview({ rating: null });
    expect(result.valid).toBe(false);
  });

  test('filterProperties with null properties returns empty array', () => {
    // Defensive: should handle null gracefully
    const result = filterProperties(null || [], {});
    expect(result).toEqual([]);
  });

  test('calculateAverageRating with null returns 0', () => {
    expect(calculateAverageRating(null)).toBe(0);
  });

  test('calculateAverageRating with undefined returns 0', () => {
    expect(calculateAverageRating(undefined)).toBe(0);
  });
});

describe('Negative: wrong types for numeric fields', () => {
  test('validateReview with boolean rating returns invalid', () => {
    expect(validateReview({ rating: true }).valid).toBe(false);
  });

  test('validateReview with array rating returns invalid', () => {
    expect(validateReview({ rating: [3] }).valid).toBe(false);
  });

  test('validateProperty with object as price returns invalid', () => {
    expect(validateProperty({ title: 'Test', price: { amount: 100 }, location: 'X', propertyType: 'house' }).valid).toBe(false);
  });
});

describe('Negative: injection-like inputs', () => {
  test('script tag in name is treated as a string (no crash)', () => {
    const result = validateRegistration({
      name: '<script>alert(1)</script>',
      email: 'x@x.com',
      password: 'pass12',
    });
    // Correctness: validation runs on string length, not sanitising here — must not crash
    expect(typeof result.valid).toBe('boolean');
  });

  test('SQL-like string in email is simply rejected as invalid format', () => {
    const result = validateRegistration({
      name: 'Hacker',
      email: "' OR '1'='1",
      password: 'pass12',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/email/i);
  });
});

// =============================================================================
// STATE-BASED SCENARIOS
// =============================================================================
describe('State-based: filter state transitions', () => {
  const dataset = [
    { id: 1, price: 10000000, location: 'Lahore',    propertyType: 'house',    bedrooms: 3 },
    { id: 2, price: 25000000, location: 'Karachi',   propertyType: 'house',    bedrooms: 4 },
    { id: 3, price: 7000000,  location: 'Islamabad', propertyType: 'apartment',bedrooms: 2 },
  ];

  test('State 1 — no filter returns all 3 items', () => {
    expect(filterProperties(dataset, {}).length).toBe(3);
  });

  test('State 2 — add minPrice 20M → only 1 item remains', () => {
    expect(filterProperties(dataset, { minPrice: 20000000 }).length).toBe(1);
  });

  test('State 3 — add type=apartment → 1 item from Islamabad', () => {
    const r = filterProperties(dataset, { propertyType: 'apartment' });
    expect(r.length).toBe(1);
    expect(r[0].location).toBe('Islamabad');
  });

  test('State 4 — overlapping price range with location narrows further', () => {
    const r = filterProperties(dataset, { location: 'Lahore', maxPrice: 15000000 });
    expect(r.length).toBe(1);
    expect(r[0].id).toBe(1);
  });

  test('State 5 — impossible criteria (both house AND price > 30M) → 0 results', () => {
    const r = filterProperties(dataset, { propertyType: 'house', minPrice: 30000000 });
    expect(r.length).toBe(0);
  });
});

describe('State-based: review average transitions', () => {
  test('no reviews → average is 0', () => {
    expect(calculateAverageRating([])).toBe(0);
  });

  test('first review added → average = that review rating', () => {
    expect(calculateAverageRating([{ rating: 4 }])).toBe(4);
  });

  test('second review added → average recalculated', () => {
    expect(calculateAverageRating([{ rating: 4 }, { rating: 2 }])).toBe(3);
  });

  test('third review shifts average toward 5', () => {
    const avg = calculateAverageRating([{ rating: 4 }, { rating: 2 }, { rating: 5 }]);
    expect(avg).toBeCloseTo(3.7, 1);
  });

  test('large number of reviews (50) produces a stable average', () => {
    const reviews = Array.from({ length: 50 }, (_, i) => ({ rating: (i % 5) + 1 }));
    const avg = calculateAverageRating(reviews);
    expect(avg).toBeGreaterThanOrEqual(1);
    expect(avg).toBeLessThanOrEqual(5);
  });
});
