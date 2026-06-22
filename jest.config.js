export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'models/**/*.js',
    'controllers/**/*.js',
    'routes/**/*.js',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 15000,
  clearMocks: true,
  resetModules: true,
  setupFiles: ['./tests/setup.js'],
};
