// tests/property.test.js
// Unit tests for property listing validation and search/filter logic
// Oracle: validateProperty() enforces correct listing data.
//         filterProperties() returns only matching records — no more, no less.

const { validateProperty, filterProperties } = require('../utils/validators');

// ─── Sample property dataset used across filter tests ────────────────────────
// Prices in PKR (Pakistani Rupees), locations are major Pakistani cities
const sampleProperties = [
  { id: 1, title: 'Gulberg Apartment',  price: 12000000,  location: 'Lahore',     propertyType: 'apartment', bedrooms: 2 },
  { id: 2, title: 'DHA Family House',   price: 35000000,  location: 'Karachi',    propertyType: 'house',     bedrooms: 4 },
  { id: 3, title: 'F-7 Luxury Flat',   price: 20000000,  location: 'Islamabad',  propertyType: 'flat',      bedrooms: 1 },
  { id: 4, title: 'Bahria Town Plot',   price: 5000000,   location: 'Rawalpindi', propertyType: 'plot',      bedrooms: 0 },
  { id: 5, title: 'Blue Area Office',   price: 50000000,  location: 'Islamabad',  propertyType: 'commercial',bedrooms: 0 },
];

// ─── PROPERTY VALIDATION ─────────────────────────────────────────────────────

describe('Property Listing Validation', () => {

  // Normal cases
  test('valid property listing is accepted', () => {
    const result = validateProperty({
      title: 'Model Town House',
      price: 25000000,
      location: 'Lahore',
      propertyType: 'house',
      bedrooms: 3,
    });
    // Oracle: complete, correct listing data must pass validation
    expect(result.valid).toBe(true);
  });

  test('property without bedrooms field is still valid (optional)', () => {
    const result = validateProperty({
      title: 'Saddar Commercial Plot',
      price: 80000000,
      location: 'Peshawar',
      propertyType: 'commercial',
    });
    expect(result.valid).toBe(true);
  });

  // Boundary cases
  test('price of exactly 1 is accepted (minimum positive price)', () => {
    const result = validateProperty({
      title: 'Rural Plot',
      price: 1,
      location: 'Dera Ismail Khan',
      propertyType: 'plot',
    });
    expect(result.valid).toBe(true);
  });

  test('title with exactly 3 characters is accepted (minimum boundary)', () => {
    const result = validateProperty({
      title: 'Apt',
      price: 10000000,
      location: 'Multan',
      propertyType: 'apartment',
    });
    expect(result.valid).toBe(true);
  });

  test('0 bedrooms is valid (e.g., studio or commercial)', () => {
    const result = validateProperty({
      title: 'Johar Town Studio',
      price: 9000000,
      location: 'Lahore',
      propertyType: 'flat',
      bedrooms: 0,
    });
    expect(result.valid).toBe(true);
  });

  // Negative / invalid input cases
  test('missing title returns error', () => {
    const result = validateProperty({
      price: 15000000,
      location: 'Faisalabad',
      propertyType: 'house',
    });
    // Oracle: title identifies the listing — it cannot be absent
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/title/i);
  });

  test('title too short returns error', () => {
    const result = validateProperty({
      title: 'Hi',
      price: 15000000,
      location: 'Faisalabad',
      propertyType: 'house',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/title/i);
  });

  test('price of zero returns error', () => {
    const result = validateProperty({
      title: 'Free House?',
      price: 0,
      location: 'Hyderabad',
      propertyType: 'house',
    });
    // Oracle: a listing with zero price is logically invalid
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/price/i);
  });

  test('negative price returns error', () => {
    const result = validateProperty({
      title: 'Negative House',
      price: -5000000,
      location: 'Karachi',
      propertyType: 'house',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/price/i);
  });

  test('non-numeric price returns error', () => {
    const result = validateProperty({
      title: 'Bad Price',
      price: 'sasta',
      location: 'Quetta',
      propertyType: 'apartment',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/price/i);
  });

  test('missing location returns error', () => {
    const result = validateProperty({
      title: 'No Location',
      price: 20000000,
      propertyType: 'house',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/location/i);
  });

  test('invalid property type returns error', () => {
    const result = validateProperty({
      title: 'Mystery Property',
      price: 20000000,
      location: 'Lahore',
      propertyType: 'castle', // not in allowed list
    });
    // Oracle: only known types should be indexed in the system
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/type/i);
  });

  test('negative bedrooms returns error', () => {
    const result = validateProperty({
      title: 'Odd Property',
      price: 10000000,
      location: 'Sialkot',
      propertyType: 'house',
      bedrooms: -1,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/bedroom/i);
  });
});

// ─── PROPERTY SEARCH / FILTER ─────────────────────────────────────────────────

describe('Property Search & Filter Logic', () => {

  test('no filters returns all properties', () => {
    const result = filterProperties(sampleProperties, {});
    // Oracle: no criteria applied → full dataset returned unchanged
    expect(result.length).toBe(sampleProperties.length);
  });

  test('filter by location returns only matching properties', () => {
    const result = filterProperties(sampleProperties, { location: 'Islamabad' });
    // Oracle: only ids 3 and 5 are in Islamabad
    expect(result.length).toBe(2);
    result.forEach((p) => expect(p.location).toMatch(/islamabad/i));
  });

  test('filter by property type returns only matching properties', () => {
    const result = filterProperties(sampleProperties, { propertyType: 'house' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });

  test('filter by minPrice excludes cheaper properties', () => {
    const result = filterProperties(sampleProperties, { minPrice: 20000000 });
    // Oracle: properties with price < 20,000,000 PKR must not appear
    result.forEach((p) => expect(p.price).toBeGreaterThanOrEqual(20000000));
  });

  test('filter by maxPrice excludes more expensive properties', () => {
    const result = filterProperties(sampleProperties, { maxPrice: 20000000 });
    result.forEach((p) => expect(p.price).toBeLessThanOrEqual(20000000));
  });

  test('filter by price range returns only in-range properties', () => {
    const result = filterProperties(sampleProperties, { minPrice: 10000000, maxPrice: 30000000 });
    // Oracle: only properties priced 10M–30M PKR inclusive
    result.forEach((p) => {
      expect(p.price).toBeGreaterThanOrEqual(10000000);
      expect(p.price).toBeLessThanOrEqual(30000000);
    });
  });

  test('filter by minBedrooms returns only properties with enough rooms', () => {
    const result = filterProperties(sampleProperties, { minBedrooms: 3 });
    // Oracle: only the 4-bedroom DHA house qualifies
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });

  test('combined filters narrow results correctly', () => {
    const result = filterProperties(sampleProperties, {
      location: 'Lahore',
      propertyType: 'apartment',
    });
    // Oracle: only the Lahore apartment matches both criteria
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });

  test('filter with no matches returns empty array', () => {
    const result = filterProperties(sampleProperties, { location: 'Dubai' });
    // Oracle: unmatched filter → empty result, never null or undefined
    expect(result).toEqual([]);
  });

  test('filtering empty dataset returns empty array', () => {
    const result = filterProperties([], { location: 'Lahore' });
    expect(result).toEqual([]);
  });
});
