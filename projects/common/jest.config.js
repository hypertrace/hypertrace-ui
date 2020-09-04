module.exports = {
  rootDir: '../../',
  collectCoverage: true,
  collectCoverageFrom: [
    'projects/common/src/**/*.ts',
    '!**/*.module.ts',
    '!**/public_api.ts',
    '!projects/common/src/test/**'
  ],
  coverageDirectory: 'coverage/common',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/common'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/common/test-report.html'
      }
    ]
  ],
  testMatch: ['<rootDir>/projects/common/**/+(*.)+(spec|test).ts'],
  modulePathIgnorePatterns: ['BOGUS'], // Need to reset from app project, but empty is merged
  watchPathIgnorePatterns: ['test-results']
};
