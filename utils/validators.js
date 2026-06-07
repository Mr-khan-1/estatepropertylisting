// utils/validators.js
// Pure business-logic helpers — easy to unit test without DB or HTTP

/**
 * Validates user registration input.
 * Returns { valid: true } or { valid: false, error: '...' }
 */
function validateRegistration({ name, email, password, role }) {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address' };
  }
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  const allowedRoles = ['user', 'agent', 'admin'];
  if (role && !allowedRoles.includes(role)) {
    return { valid: false, error: 'Invalid role' };
  }
  return { valid: true };
}

/**
 * Validates a property listing input.
 * Returns { valid: true } or { valid: false, error: '...' }
 */
function validateProperty({ title, price, location, propertyType, bedrooms }) {
  if (!title || title.trim().length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  if (price === undefined || price === null || isNaN(price) || price <= 0) {
    return { valid: false, error: 'Price must be a positive number' };
  }
  if (!location || location.trim().length === 0) {
    return { valid: false, error: 'Location is required' };
  }
  const allowedTypes = ['house', 'apartment', 'flat', 'plot', 'commercial'];
  if (!propertyType || !allowedTypes.includes(propertyType)) {
    return { valid: false, error: 'Invalid property type' };
  }
  if (bedrooms !== undefined && (isNaN(bedrooms) || bedrooms < 0)) {
    return { valid: false, error: 'Bedrooms must be a non-negative number' };
  }
  return { valid: true };
}

/**
 * Validates a review submission.
 * Returns { valid: true } or { valid: false, error: '...' }
 */
function validateReview({ rating, comment }) {
  if (rating === undefined || rating === null || isNaN(rating)) {
    return { valid: false, error: 'Rating is required' };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }
  if (!Number.isInteger(Number(rating))) {
    return { valid: false, error: 'Rating must be a whole number' };
  }
  if (comment && comment.length > 1000) {
    return { valid: false, error: 'Comment must not exceed 1000 characters' };
  }
  return { valid: true };
}

/**
 * Filters properties by search criteria.
 * Returns filtered array — pure function, no DB needed.
 */
function filterProperties(properties, { minPrice, maxPrice, location, propertyType, minBedrooms } = {}) {
  return properties.filter((p) => {
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (propertyType && p.propertyType !== propertyType) return false;
    if (minBedrooms !== undefined && p.bedrooms < minBedrooms) return false;
    return true;
  });
}

/**
 * Calculates the average rating for a property from its reviews.
 */
function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // 1 decimal place
}

/**
 * Formats a price number into a readable currency string.
 * Defaults to PKR (Pakistani Rupee).
 */
function formatPrice(price, currency = 'PKR') {
  if (isNaN(price) || price < 0) return 'Invalid price';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency }).format(price);
}

module.exports = {
  validateRegistration,
  validateProperty,
  validateReview,
  filterProperties,
  calculateAverageRating,
  formatPrice,
};
