module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'models/**/*.js',
    'controllers/**/*.js',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
