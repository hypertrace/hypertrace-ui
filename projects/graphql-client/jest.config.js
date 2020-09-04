module.exports = {
  rootDir: '../../',
  collectCoverage: true,
  collectCoverageFrom: [
    'projects/graphql-client/src/**/*.ts',
    '!**/*.module.ts',
    '!**/public_api.ts',
    '!projects/graphql-client/src/test/**'
  ],
  coverageDirectory: 'coverage/graphql-client',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/graphql-client'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/graphql-client/test-report.html'
      }
    ]
  ],
  testMatch: ['<rootDir>/projects/graphql-client/**/+(*.)+(spec|test).ts'],
  modulePathIgnorePatterns: ['BOGUS'], // Need to reset from app project, but empty is merged
  watchPathIgnorePatterns: ['test-results']
};
