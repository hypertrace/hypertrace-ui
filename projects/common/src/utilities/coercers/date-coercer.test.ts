import { DateCoercer } from './date-coercer';

describe('Date coercer', () => {
  const basicCoercer = new DateCoercer();
  // These tests will all fail in 2029 due to the 10 year range, hope that's a problem :)
  const dateInMillis = 1555000427046;
  const dateInMillisRounded = 1555000427000;
  const dataAsDate = new Date(dateInMillis);
  const dateAsIsoString = '2019-04-11T16:33:47.046Z';

  test('coerces number', () => {
    expect(basicCoercer.coerce(dateInMillis)).toEqual(dataAsDate);
  });

  test('coerces string', () => {
    expect(basicCoercer.coerce(dateAsIsoString)).toEqual(dataAsDate);
    expect(basicCoercer.coerce('Thu Apr 11 2019 09:33:47 GMT-0700 (Pacific Daylight Time)')).toEqual(
      new Date(dateInMillisRounded)
    );
    expect(basicCoercer.coerce('Thu, 11 Apr 2019 16:33:47 GMT')).toEqual(new Date(dateInMillisRounded));
    expect(basicCoercer.coerce('2019-04-11T16:33:47Z')).toEqual(new Date(dateInMillisRounded));
    // Not checking these against actual times, just making sure they succeed
    expect(basicCoercer.canCoerce('2019-04-11')).toBe(true);
    expect(basicCoercer.canCoerce('2019-04-11T16:33')).toBe(true);
  });

  test('coerces date', () => {
    expect(basicCoercer.coerce(dataAsDate)).toEqual(dataAsDate);
  });

  test('limits in time range', () => {
    const limitedCoercer = new DateCoercer({
      earliestDate: new Date('2019-04-10T16:33:47.046Z'),
      latestDate: new Date('2019-04-12T16:33:47.046Z')
    });
    expect(limitedCoercer.coerce('2019-04-09T16:33:47.046Z')).toBeUndefined();
    expect(limitedCoercer.coerce('2019-04-11T16:33:47.046Z')).toBeDefined();
    expect(limitedCoercer.coerce('2019-04-13T16:33:47.046Z')).toBeUndefined();
  });

  test('defaults 10 year time range', () => {
    expect(basicCoercer.coerce(0)).toBeUndefined();
    expect(basicCoercer.coerce('2009-04-11T16:33:47.046Z')).toBeUndefined();
    expect(basicCoercer.coerce('2019-04-11T16:33:47.046Z')).toBeDefined();
    // This will fail in 2021 too, just bump the year
    expect(basicCoercer.coerce('2031-04-11T16:33:47.046Z')).toBeUndefined();
  });

  test('rejects non dates', () => {
    expect(basicCoercer.coerce(NaN)).toBeUndefined();
    // tslint:disable-next-line: no-null-keyword
    expect(basicCoercer.coerce(null)).toBeUndefined();
    expect(basicCoercer.coerce('string')).toBeUndefined();
    expect(basicCoercer.coerce({})).toBeUndefined();
    expect(basicCoercer.coerce([])).toBeUndefined();
  });

  test('works with object and array keys', () => {
    const coercer = new DateCoercer({
      extractObjectKeys: ['foo'],
      extractArrayIndices: [0]
    });

    expect(coercer.coerce({ foo: dataAsDate })).toEqual(dataAsDate);
    expect(coercer.coerce([dataAsDate])).toEqual(dataAsDate);
  });

  test('uses default value', () => {
    const defaultingCoercer = new DateCoercer({
      defaultValue: dataAsDate
    });
    expect(defaultingCoercer.coerce({})).toEqual(dataAsDate);
  });
});
