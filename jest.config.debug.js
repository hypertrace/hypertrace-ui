process.env.TZ = 'UTC'; // Tests should always run in UTC, no time zone dependencies

module.exports = {
  preset: 'jest-preset-angular',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
      astTransformers: [
        'jest-preset-angular/build/InlineFilesTransformer',
        'jest-preset-angular/build/StripStylesTransformer'
      ]
    }
  },
  setupFilesAfterEnv: ['<rootDir>/node_modules/@angular-builders/jest/dist/jest-config/setup.js'],
  testMatch: ['<rootDir>/(src|projects)/**/+(*.)+(spec|test).ts'],
  watchPathIgnorePatterns: ['test-results'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '@hypertrace/assets-library': '<rootDir>/hypertrace-core-ui/projects/assets-library/src/public-api.ts',
    '@hypertrace/common$': '<rootDir>/hypertrace-core-ui/projects/common/src/public-api.ts',
    '@hypertrace/components': '<rootDir>/hypertrace-core-ui/projects/components/src/public-api.ts',
    '@hypertrace/dashboards$': '<rootDir>/hypertrace-core-ui/projects/dashboards/src/public-api.ts',
    '@hypertrace/dashboards/testing': '<rootDir>/hypertrace-core-ui/projects/dashboards/src/test/public-api.ts',
    '@hypertrace/test-utils': '<rootDir>/hypertrace-core-ui/projects/test-utils/src/public-api.ts',
    '@hypertrace/graphql-client': '<rootDir>/hypertrace-core-ui/projects/graphql-client/src/public-api.ts',
    '@hypertrace/distributed-tracing': '<rootDir>/hypertrace-core-ui/projects/distributed-tracing/src/public-api.ts',
    '@hypertrace/observability': '<rootDir>/projects/observability/src/public-api.ts'
  }
};
