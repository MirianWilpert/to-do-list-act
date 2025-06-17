module.exports = {
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],

  moduleNameMapping: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
  },

  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  coverageDirectory: 'coverage',

  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  testTimeout: 10000,

  clearMocks: true,

  verbose: true,

  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};