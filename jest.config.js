const path = require('path');

const parts = path.resolve('.').split('/');
const package = parts[parts.length - 1];

module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    // '!**/dist/**',
    `<rootDir>/packages/${package}/src/**/*.{ts,tsx}`,
  ],
  coverageDirectory: `<rootDir>/packages/${package}/coverage`,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    `<rootDir>/packages/${package}/src/**/*.test.{ts,tsx}`,
  ],
};
