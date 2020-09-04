import { durationFormatter } from './duration-formatter';

describe('DurationFormatter', () => {
  test('can format duration', () => {
    expect(durationFormatter(100)).toEqual('100');
    expect(durationFormatter(1000)).toEqual('1.000');
    expect(durationFormatter(10000)).toEqual('10.000');
    expect(durationFormatter(100000)).toEqual('1:40.000');
    expect(durationFormatter(1000000)).toEqual('16:40.000');
    expect(durationFormatter(10000000)).toEqual('2:46:40.000');
    expect(durationFormatter(100000000)).toEqual('3:46:40.000');
    expect(durationFormatter(1234567891234)).toEqual('23:31:31.234');
  });
});
