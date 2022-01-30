const nxPreset = require('@nrwl/jest/preset');
process.env.TZ = 'UTC'; // Tests should always run in UTC, no time zone dependencies

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...nxPreset.moduleNameMapper,
    '^lodash-es$': 'lodash'
  },
  maxWorkers: 2,
  testRunner: 'jest-jasmine2'
};
