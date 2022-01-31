module.exports = {
  displayName: 'assets-library',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }
  },
  coverageDirectory: '../../coverage/libs/assets-library',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/hypertrace-ui/libs/assets-library'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/hypertrace-ui/libs/assets-library/test-report.html'
      }
    ]
  ],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ]
};
