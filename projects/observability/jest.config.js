module.exports = {
  rootDir: '../../',
  collectCoverage: true,
  collectCoverageFrom: [
    'projects/observability/src/**/*.ts',
    '!**/*.module.ts',
    '!**/public_api.ts',
    '!projects/observability/src/test/**'
  ],
  coverageDirectory: 'coverage/observability',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/observability'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/observability/test-report.html'
      }
    ]
  ],
  testEnvironment: 'jest-environment-jsdom-sixteen', // Update test env to newer jsdom for bug fixes
  testMatch: ['<rootDir>/projects/observability/**/+(*.)+(spec|test).ts'],
  modulePathIgnorePatterns: ['BOGUS'], // Need to reset from app project, but empty is merged
  watchPathIgnorePatterns: ['test-results']
};
