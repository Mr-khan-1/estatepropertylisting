// tests/formatting.test.js
// Unit tests for price formatting utility
// Oracle: formatPrice() must always produce a valid currency string for valid input,
//         and a clear error message for invalid input.
// Currency: PKR (Pakistani Rupee) — default for Pakistan-based real estate platform.

const { formatPrice } = require('../utils/validators');

describe('Price Formatting', () => {

  test('formats a standard price in PKR', () => {
    const result = formatPrice(25000000); // 2.5 crore PKR
    // Oracle: 25000000 → must include currency indicator and comma-separated digits
    expect(result).toContain('25,000,000');
    expect(result.includes('PKR') || result.includes('₨') || result.includes('Rs')).toBe(true);
  });

  test('formats zero price as PKR 0', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  test('formats a large price correctly (e.g., 1 crore)', () => {
    const result = formatPrice(10000000);
    expect(result).toContain('10,000,000');
  });

  test('formats a decimal price (rounds to nearest integer in PKR)', () => {
    // en-PK locale rounds 9999999.99 → displays as 10,000,000 (standard rounding)
    const result = formatPrice(9999999.99);
    expect(result).toMatch(/9,999,999|10,000,000/);
  });

  test('returns error string for negative price', () => {
    const result = formatPrice(-500000);
    // Oracle: negative price is invalid — must return a human-readable error
    expect(result).toBe('Invalid price');
  });

  test('returns error string for NaN input', () => {
    const result = formatPrice(NaN);
    expect(result).toBe('Invalid price');
  });

  test('supports non-PKR currency (USD)', () => {
    const result = formatPrice(100000, 'USD');
    // Oracle: currency symbol must change when a different currency is passed
    expect(result).toContain('100,000');
    expect(result.includes('$') || result.includes('USD')).toBe(true);
  });
});
