/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/__tests__/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
  ],
  collectCoverage: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^(\\.{1,2}/.*)\\.json$': '$1.json',
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          target: 'es2022',
          resolveJsonModule: true,
          moduleResolution: 'node',
          esModuleInterop: true,
        },
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
