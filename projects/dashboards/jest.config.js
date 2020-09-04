module.exports = {
  rootDir: '../../',
  coverageThreshold: {
    global: {
      statements: 19,
      branches: 18,
      lines: 19,
      functions: 14
    }
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'projects/dashboards/src/**/*.ts',
    '!**/*.module.ts',
    '!**/public-api.ts',
    '!projects/dashboards/src/test/**'
  ],
  coverageDirectory: 'coverage/dashboards',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/dashboards'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/dashboards/test-report.html'
      }
    ]
  ],
  modulePathIgnorePatterns: ['BOGUS', '<rootDir>/dist/'], // Need to reset from app project, but empty is merged
  watchPathIgnorePatterns: ['test-results'],
  testMatch: ['<rootDir>/projects/dashboards/**/+(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '@hypertrace/common': '<rootDir>/projects/common/src/public-api.ts',
    '@hypertrace/components': '<rootDir>/projects/components/src/public-api.ts'
  }
};
