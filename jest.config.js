module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  // Disable watch mode by default
  watch: false,
  // Optimize for manual test runs
  bail: true, // Stop running tests after the first failure
  verbose: true,
  testTimeout: 10000, 
}
