module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/utils/logger.js',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  // JUnit reporter for Jenkins to parse test results
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
    }],
  ],
  testTimeout: 30000,
  forceExit: true,
  verbose: true,
};
