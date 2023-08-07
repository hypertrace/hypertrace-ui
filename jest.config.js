const { pathsToModuleNameMapper } = require('ts-jest');
const { paths } = require('./tsconfig.json').compilerOptions;

process.env.TZ = 'UTC'; // Tests should always run in UTC, no time zone dependencies

// eslint-disable-next-line no-undef
globalThis.ngJest = {
  skipNgcc: false,
  tsconfig: 'tsconfig.spec.json'
};

module.exports = {
  rootDir: '.',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
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
    '^uuid$': 'uuid',
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>' })
  }
};
