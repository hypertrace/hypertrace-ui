import { durationFormatter } from './duration-formatter';

describe('DurationFormatter', () => {
  test('can format duration', () => {
    expect(durationFormatter(0)).toEqual('0ms');
    expect(durationFormatter(100)).toEqual('100ms');
    expect(durationFormatter(1000)).toEqual('1s');
    expect(durationFormatter(10000)).toEqual('10s');
    expect(durationFormatter(100000)).toEqual('1m 40s');
    expect(durationFormatter(1000000)).toEqual('16m 40s');
    expect(durationFormatter(10000000)).toEqual('2h 46m');
    expect(durationFormatter(100000000)).toEqual('3h 46m');
    expect(durationFormatter(1234567891234)).toEqual('23h 31m');
  });
});
