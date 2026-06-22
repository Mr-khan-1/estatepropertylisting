// tests/property_based.test.js
// Property-Based Testing — Phase 3 requirement (at least basic level)
//
// Tool: fast-check (property-based / generative testing library for JavaScript)
// Strategy: Instead of fixed examples, we GENERATE hundreds of random inputs
//   and assert that invariants hold for ALL of them.
//
// Invariants tested:
//   1. filterProperties() never returns MORE results than the input array
//   2. filterProperties() result always satisfies the filter criteria
//   3. calculateAverageRating() result is always in [1, 5] for valid reviews
//   4. calculateAverageRating([]) is always 0
//   5. formatPrice() never returns undefined or null for any finite number
//   6. validateRegistration() never throws — always returns a result object
//   7. validateProperty() never throws — always returns a result object
//   8. filterProperties() applied twice with the same filter = same result (idempotency)

const fc = require('fast-check');
const {
  validateRegistration,
  validateProperty,
  filterProperties,
  calculateAverageRating,
  formatPrice,
  validateReview,
} = require('../utils/validators');

// ── Helper: generate a valid-looking property object ─────────────────────────
const propertyArb = fc.record({
  id: fc.nat(),
  title: fc.string({ minLength: 3, maxLength: 50 }),
  price: fc.integer({ min: 1, max: 100000000 }),
  location: fc.constantFrom('Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar'),
  propertyType: fc.constantFrom('house', 'apartment', 'flat', 'plot', 'commercial'),
  bedrooms: fc.nat({ max: 10 }),
});

// ── Helper: generate filter criteria ─────────────────────────────────────────
const filterArb = fc.record({
  minPrice: fc.option(fc.integer({ min: 0, max: 100000000 }), { nil: undefined }),
  maxPrice: fc.option(fc.integer({ min: 0, max: 100000000 }), { nil: undefined }),
  location: fc.option(fc.constantFrom('Lahore', 'Karachi', 'Islamabad', 'Dubai'), { nil: undefined }),
  propertyType: fc.option(fc.constantFrom('house', 'apartment', 'flat', 'castle'), { nil: undefined }),
  minBedrooms: fc.option(fc.nat({ max: 5 }), { nil: undefined }),
});

// =============================================================================
// 1. filterProperties — count invariant
// =============================================================================
describe('Property-Based: filterProperties count invariant', () => {
  test('result count is always ≤ input count', () => {
    fc.assert(
      fc.property(fc.array(propertyArb, { maxLength: 20 }), filterArb, (props, filters) => {
        const result = filterProperties(props, filters);
        // Invariant: a filter can only shrink or keep the array, never grow it
        return result.length <= props.length;
      }),
      { numRuns: 200 }
    );
  });
});

// =============================================================================
// 2. filterProperties — results always satisfy the filter criteria
// =============================================================================
describe('Property-Based: filterProperties result correctness', () => {
  test('every result satisfies all active filter conditions', () => {
    fc.assert(
      fc.property(fc.array(propertyArb, { maxLength: 30 }), filterArb, (props, filters) => {
        const result = filterProperties(props, filters);
        return result.every((p) => {
          if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
          if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
          if (filters.location !== undefined && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
          if (filters.propertyType !== undefined && p.propertyType !== filters.propertyType) return false;
          if (filters.minBedrooms !== undefined && p.bedrooms < filters.minBedrooms) return false;
          return true;
        });
      }),
      { numRuns: 200 }
    );
  });
});

// =============================================================================
// 3. filterProperties — idempotency
// =============================================================================
describe('Property-Based: filterProperties idempotency', () => {
  test('applying the same filter twice gives the same result as applying it once', () => {
    fc.assert(
      fc.property(fc.array(propertyArb, { maxLength: 20 }), filterArb, (props, filters) => {
        const once = filterProperties(props, filters);
        const twice = filterProperties(once, filters);
        // Invariant: if result already satisfies filter, re-filtering must not change it
        return twice.length === once.length;
      }),
      { numRuns: 150 }
    );
  });
});

// =============================================================================
// 4. calculateAverageRating — result always in valid range for non-empty input
// =============================================================================
describe('Property-Based: calculateAverageRating range invariant', () => {
  test('average is always between 1 and 5 when reviews have valid ratings', () => {
    const validReviewsArb = fc.array(
      fc.record({ rating: fc.integer({ min: 1, max: 5 }) }),
      { minLength: 1, maxLength: 50 }
    );
    fc.assert(
      fc.property(validReviewsArb, (reviews) => {
        const avg = calculateAverageRating(reviews);
        // Invariant: average of numbers in [1,5] must itself be in [1,5]
        return avg >= 1 && avg <= 5;
      }),
      { numRuns: 300 }
    );
  });

  test('empty array always returns 0', () => {
    // Invariant: no reviews = no rating = 0, without exception
    expect(calculateAverageRating([])).toBe(0);
  });

  test('result is always rounded to 1 decimal place (max 1 decimal digit)', () => {
    const validReviewsArb = fc.array(
      fc.record({ rating: fc.integer({ min: 1, max: 5 }) }),
      { minLength: 1, maxLength: 50 }
    );
    fc.assert(
      fc.property(validReviewsArb, (reviews) => {
        const avg = calculateAverageRating(reviews);
        const decimalPart = (avg * 10) % 1;
        // Invariant: result rounded to 1dp means (avg * 10) is always a whole number
        return Math.abs(decimalPart) < 0.0001;
      }),
      { numRuns: 300 }
    );
  });
});

// =============================================================================
// 5. formatPrice — never returns null or undefined
// =============================================================================
describe('Property-Based: formatPrice never returns null/undefined', () => {
  test('any non-negative finite number always produces a non-empty string', () => {
    fc.assert(
      fc.property(fc.nat({ max: 999999999 }), (price) => {
        const result = formatPrice(price);
        // Invariant: the display layer must always get a printable value
        return typeof result === 'string' && result.length > 0;
      }),
      { numRuns: 300 }
    );
  });

  test('negative numbers always return "Invalid price"', () => {
    fc.assert(
      fc.property(fc.integer({ min: -999999, max: -1 }), (price) => {
        const result = formatPrice(price);
        return result === 'Invalid price';
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// 6. validateRegistration — never throws
// =============================================================================
describe('Property-Based: validateRegistration never throws', () => {
  test('any arbitrary input object never causes an exception', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.oneof(fc.string(), fc.constant(undefined), fc.constant(null)),
          email: fc.oneof(fc.string(), fc.constant(undefined), fc.emailAddress()),
          password: fc.oneof(fc.string(), fc.constant(undefined)),
          role: fc.oneof(fc.string(), fc.constant(undefined)),
        }),
        (input) => {
          let threw = false;
          try {
            const result = validateRegistration(input);
            // Invariant: result must always be an object with a boolean 'valid' field
            if (typeof result !== 'object' || typeof result.valid !== 'boolean') threw = true;
          } catch {
            threw = true;
          }
          return !threw;
        }
      ),
      { numRuns: 300 }
    );
  });
});

// =============================================================================
// 7. validateProperty — never throws + always returns result object
// =============================================================================
describe('Property-Based: validateProperty never throws', () => {
  test('any arbitrary input never causes an exception', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.oneof(fc.string(), fc.constant(undefined)),
          price: fc.oneof(fc.integer(), fc.constant(undefined), fc.constant(NaN), fc.constant(-1)),
          location: fc.oneof(fc.string(), fc.constant(undefined)),
          propertyType: fc.oneof(fc.string(), fc.constant(undefined)),
          bedrooms: fc.oneof(fc.nat(), fc.constant(undefined), fc.integer({ min: -10, max: -1 })),
        }),
        (input) => {
          let threw = false;
          try {
            const result = validateProperty(input);
            if (typeof result !== 'object' || typeof result.valid !== 'boolean') threw = true;
          } catch {
            threw = true;
          }
          return !threw;
        }
      ),
      { numRuns: 300 }
    );
  });
});

// =============================================================================
// 8. validateReview — rating invariant
// =============================================================================
describe('Property-Based: validateReview rating boundary invariant', () => {
  test('ratings in [1,5] always pass, ratings outside always fail', () => {
    // Valid ratings: 1–5 (integers)
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (rating) => {
        const result = validateReview({ rating });
        return result.valid === true;
      }),
      { numRuns: 50 }
    );

    // Invalid ratings: integers below 1 or above 5
    fc.assert(
      fc.property(
        fc.oneof(fc.integer({ min: -100, max: 0 }), fc.integer({ min: 6, max: 100 })),
        (rating) => {
          const result = validateReview({ rating });
          return result.valid === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
