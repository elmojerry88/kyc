module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@kyc/agent$': '<rootDir>/../../packages/agent/src',
    '^@kyc/shared$': '<rootDir>/../../packages/shared/src'
  }
};
