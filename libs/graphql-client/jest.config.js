module.exports = {
  displayName: 'graphql-client',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }
  },
  coverageDirectory: '../../coverage/libs/graphql-client',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/hypertrace-ui/libs/graphql-client'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/hypertrace-ui/libs/graphql-client/test-report.html'
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
