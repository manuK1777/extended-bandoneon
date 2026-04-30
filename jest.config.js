module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Changed from 'node' to 'jsdom' for React testing
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  // Disable watch mode by default
  watch: false,
  // Optimize for manual test runs
  bail: true, // Stop running tests after the first failure
  verbose: true,
  testTimeout: 10000,
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
