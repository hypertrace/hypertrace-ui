module.exports = {
  displayName: 'hypertrace-ui',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }
  },
  coverageDirectory: '../../coverage/apps/hypertrace-ui',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results/hypertrace-ui'
      }
    ],
    [
      'jest-html-reporter',
      {
        outputPath: './test-results/hypertrace-ui/test-report.html'
      }
    ]
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/*.d.ts',
    '!src/main.ts',
    '!src/environments/**',
    '!**/*/test/**',
    '!src/app/routes/**/*.ts'
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
