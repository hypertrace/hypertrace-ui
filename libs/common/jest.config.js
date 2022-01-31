module.exports = {
  displayName: 'common',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }
  },
  coverageDirectory: '../../coverage/libs/common',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/hypertrace-ui/libs/common'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/hypertrace-ui/libs/common/test-report.html'
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
