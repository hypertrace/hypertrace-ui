module.exports = {
  rootDir: '../../',
  coverageThreshold: {
    global: {
      statements: 31,
      branches: 25,
      lines: 30,
      functions: 26
    }
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'projects/components/src/**/*.ts',
    '!**/*.module.ts',
    '!**/public-api.ts',
    '!projects/components/src/test/**'
  ],
  coverageDirectory: 'coverage/components',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/components'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/components/test-report.html'
      }
    ]
  ],
  modulePathIgnorePatterns: ['BOGUS', '<rootDir>/dist/'], // Need to reset from app project, but empty is merged
  watchPathIgnorePatterns: ['test-results'],
  testMatch: ['<rootDir>/projects/components/**/+(*.)+(spec|test).ts']
};
