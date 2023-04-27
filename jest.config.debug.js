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
  transform: {
    '^.+\\.(ts|js|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  testMatch: ['<rootDir>/(src|projects)/**/+(*.)+(spec|test).ts'],
  watchPathIgnorePatterns: ['test-results'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^uuid$': 'uuid',
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>' })
  }
};
