process.env.TZ = 'UTC'; // Tests should always run in UTC, no time zone dependencies

module.exports = {
  rootDir: '.',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/hypertrace-ui'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/hypertrace-ui/test-report.html'
      }
    ]
  ],
  watchPathIgnorePatterns: ['test-results'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'projects/!(test-utils)/src/**/*.ts',
    '!**/*.d.ts',
    '!src/main.ts',
    '!src/environments/**',
    '!**/*/test/**',
    '!src/app/routes/**/*.ts'
  ],
  coverageDirectory: 'coverage/hypertrace-ui',
  modulePathIgnorePatterns: ['<rootDir>/dist/'], // Need to reset from app project, but empty is merged
  testMatch: ['<rootDir>/(src|projects)/**/+(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '@hypertrace/assets-library': '<rootDir>/projects/assets-library/src/public-api.ts',
    '@hypertrace/common$': '<rootDir>/projects/common/src/public-api.ts',
    '@hypertrace/components': '<rootDir>/projects/components/src/public-api.ts',
    '@hypertrace/dashboards$': '<rootDir>/projects/dashboards/src/public-api.ts',
    '@hypertrace/dashboards/testing': '<rootDir>/projects/dashboards/src/test/public-api.ts',
    '@hypertrace/test-utils': '<rootDir>/projects/test-utils/src/public-api.ts',
    '@hypertrace/graphql-client': '<rootDir>/projects/graphql-client/src/public-api.ts',
    '@hypertrace/distributed-tracing': '<rootDir>/projects/distributed-tracing/src/public-api.ts',
    '@hypertrace/observability': '<rootDir>/projects/observability/src/public-api.ts'
  }
};
