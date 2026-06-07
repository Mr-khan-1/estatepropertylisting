// tests/review.test.js
// Unit tests for the Review & Rating module
// Oracle: validateReview() enforces rating bounds and comment length.
//         calculateAverageRating() must always return a mathematically correct average.

const { validateReview, calculateAverageRating } = require('../utils/validators');

// ─── REVIEW VALIDATION ───────────────────────────────────────────────────────

describe('Review Input Validation', () => {

  // Normal cases
  test('valid review with rating and comment is accepted', () => {
    const result = validateReview({ rating: 4, comment: 'Great property!' });
    // Oracle: well-formed review must pass without errors
    expect(result.valid).toBe(true);
  });

  test('valid review without comment is accepted (comment is optional)', () => {
    const result = validateReview({ rating: 5 });
    expect(result.valid).toBe(true);
  });

  // Boundary cases — rating boundaries
  test('rating of 1 is accepted (minimum boundary)', () => {
    const result = validateReview({ rating: 1 });
    expect(result.valid).toBe(true);
  });

  test('rating of 5 is accepted (maximum boundary)', () => {
    const result = validateReview({ rating: 5 });
    expect(result.valid).toBe(true);
  });

  test('comment of exactly 1000 characters is accepted (maximum boundary)', () => {
    const longComment = 'a'.repeat(1000);
    const result = validateReview({ rating: 3, comment: longComment });
    expect(result.valid).toBe(true);
  });

  // Negative / invalid input cases
  test('rating of 0 returns error (below minimum)', () => {
    const result = validateReview({ rating: 0 });
    // Oracle: a rating of 0 is meaningless on a 1–5 scale
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/rating/i);
  });

  test('rating of 6 returns error (above maximum)', () => {
    const result = validateReview({ rating: 6 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/rating/i);
  });

  test('negative rating returns error', () => {
    const result = validateReview({ rating: -1 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/rating/i);
  });

  test('missing rating returns error', () => {
    const result = validateReview({ comment: 'No rating given' });
    // Oracle: rating is the core of a review — it must always be present
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/rating/i);
  });

  test('non-numeric rating returns error', () => {
    const result = validateReview({ rating: 'five' });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/rating/i);
  });

  test('comment exceeding 1000 characters returns error', () => {
    const tooLong = 'a'.repeat(1001);
    const result = validateReview({ rating: 3, comment: tooLong });
    // Oracle: oversized comments must be rejected to protect DB storage
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/comment/i);
  });

  test('decimal rating like 3.5 returns error (must be whole number)', () => {
    const result = validateReview({ rating: 3.5 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/rating/i);
  });
});

// ─── AVERAGE RATING CALCULATION ──────────────────────────────────────────────

describe('Average Rating Calculation', () => {

  test('average of [5, 5, 5] is 5.0', () => {
    const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 5 }];
    // Oracle: uniform perfect ratings → average must equal 5
    expect(calculateAverageRating(reviews)).toBe(5);
  });

  test('average of [1, 2, 3, 4, 5] is 3.0', () => {
    const reviews = [1, 2, 3, 4, 5].map((r) => ({ rating: r }));
    expect(calculateAverageRating(reviews)).toBe(3);
  });

  test('average of [4, 5] is 4.5', () => {
    const reviews = [{ rating: 4 }, { rating: 5 }];
    expect(calculateAverageRating(reviews)).toBe(4.5);
  });

  test('average of a single review equals that review rating', () => {
    const reviews = [{ rating: 3 }];
    // Oracle: one review → average is trivially equal to it
    expect(calculateAverageRating(reviews)).toBe(3);
  });

  test('average of [1, 1, 1] is 1.0', () => {
    const reviews = [{ rating: 1 }, { rating: 1 }, { rating: 1 }];
    expect(calculateAverageRating(reviews)).toBe(1);
  });

  test('empty reviews array returns 0 (no rating yet)', () => {
    // Oracle: a property with no reviews has no average — return 0 as sentinel
    expect(calculateAverageRating([])).toBe(0);
  });

  test('null or undefined reviews returns 0 (defensive)', () => {
    // Oracle: the function must never throw when called with missing data
    expect(calculateAverageRating(null)).toBe(0);
    expect(calculateAverageRating(undefined)).toBe(0);
  });

  test('result is rounded to 1 decimal place', () => {
    // 1 + 2 + 3 = 6 / 3 = 2.0 — but test with imprecise average:
    // 1 + 2 = 3 / 2 = 1.5 (already clean)
    // Use 1 + 1 + 2 = 4 / 3 = 1.333... → should round to 1.3
    const reviews = [{ rating: 1 }, { rating: 1 }, { rating: 2 }];
    const avg = calculateAverageRating(reviews);
    // Oracle: display precision must be 1 decimal place
    expect(avg).toBe(1.3);
  });
});
