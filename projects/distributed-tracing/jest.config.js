module.exports = {
  rootDir: '../../',
  collectCoverage: true,
  collectCoverageFrom: [
    'projects/distributed-tracing/src/**/*.ts',
    '!**/*.module.ts',
    '!**/public_api.ts',
    '!projects/distributed-tracing/src/test/**'
  ],
  coverageDirectory: 'coverage/distributed-tracing',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/distributed-tracing'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/distributed-tracing/test-report.html'
      }
    ]
  ],
  testMatch: ['<rootDir>/projects/distributed-tracing/**/+(*.)+(spec|test).ts'],
  modulePathIgnorePatterns: ['BOGUS'], // Need to reset from app project, but empty is merged
  watchPathIgnorePatterns: ['test-results']
};
