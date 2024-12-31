/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/__tests__/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
    '!<rootDir>/src/utils/version.ts',  // Exclude version.ts from coverage
  ],
  collectCoverage: true,
  moduleNameMapper: {
    '#(.*)': '<rootDir>/node_modules/$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!chalk|@mcpm/sdk|.*)'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
