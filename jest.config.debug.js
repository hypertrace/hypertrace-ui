module.exports = {
  displayName: 'app-debug',
  preset: './jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/node_modules/@angular-builders/jest/dist/jest-config/setup.js'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/apps/hypertrace-ui/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  watchPathIgnorePatterns: ['test-results'],
  modulePathIgnorePatterns: ['<rootDir>/dist/']
};
