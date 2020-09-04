module.exports = {
  rootDir: '../../',
  collectCoverage: true,
  collectCoverageFrom: [
    'projects/assets-library/src/**/*.ts',
    '!**/*.module.ts',
    '!**/public-api.ts',
    '!projects/assets-library/src/test/**'
  ],
  coverageDirectory: 'coverage/assets-library',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/assets-library'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/assets-library/test-report.html'
      }
    ]
  ],
  modulePathIgnorePatterns: ['BOGUS', '<rootDir>/dist/'], // Need to reset from app project, but empty is merged
  watchPathIgnorePatterns: ['test-results'],
  testMatch: ['<rootDir>/projects/assets-library/**/+(*.)+(spec|test).ts']
};
