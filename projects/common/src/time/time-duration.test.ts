import { TimeDuration, UnitStringType } from './time-duration';
import { TimeUnit } from './time-unit.type';

describe('Time duration', () => {
  test('can convert to millis', () => {
    expect(new TimeDuration(3, TimeUnit.Minute).toMillis()).toBe(3 * 60 * 1000);
    expect(new TimeDuration(4, TimeUnit.Hour).toMillis()).toBe(4 * 60 * 60 * 1000);
  });

  test('converts to ISO 8601 duration string correctly', () => {
    expect(new TimeDuration(1, TimeUnit.Hour).toIso8601DurationString()).toBe('PT1H');
    expect(new TimeDuration(1, TimeUnit.Day).toIso8601DurationString()).toBe('P1D');
  });

  test('can print a multi unit string', () => {
    expect(
      new TimeDuration(4 * 60 * 60 * 1000 + 3 * 60 * 1000 + 5 * 1000 + 689, TimeUnit.Millisecond).toMultiUnitString(
        TimeUnit.Minute
      )
    ).toBe('4h3m');
    expect(
      new TimeDuration(4 * 60 * 60 * 1000 + 3 * 60 * 1000 + 5 * 1000 + 689, TimeUnit.Millisecond).toMultiUnitString(
        TimeUnit.Minute,
        false,
        UnitStringType.Long
      )
    ).toBe('4 hours 3 minutes');
    expect(
      new TimeDuration(4 * 60 * 60 * 1000 + 5 * 1000 + 689, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Second)
    ).toBe('4h5s');
    expect(
      new TimeDuration(4 * 60 * 60 * 1000 + 3 * 60 * 1000 + 5 * 1000 + 689, TimeUnit.Millisecond).toMultiUnitString(
        TimeUnit.Second
      )
    ).toBe('4h3m5s');
    expect(new TimeDuration(4 * 60 * 60 * 1000, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Second)).toBe('4h');
    expect(
      new TimeDuration(4 * 60 * 60 * 1000 + 3 * 60 * 1000 + 5 * 1000 + 689, TimeUnit.Millisecond).toMultiUnitString(
        TimeUnit.Second
      )
    ).toBe('4h3m5s');
    expect(
      new TimeDuration(4 * 60 * 60 * 1000 + 5 * 1000, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Second)
    ).toBe('4h5s');
    expect(new TimeDuration(689, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Minute)).toBe('0m');
    expect(new TimeDuration(689, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Second)).toBe('0s');
    expect(new TimeDuration(1, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Millisecond)).toBe('1ms');
    expect(new TimeDuration(0, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Millisecond)).toBe('0ms');

    expect(new TimeDuration(3 * 60 * 1000 + 689, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Second)).toBe('3m');
  });

  test('can convert to different units', () => {
    const twoWeeks = new TimeDuration(2, TimeUnit.Week);
    expect(twoWeeks.getAmountForUnit(TimeUnit.Day)).toBe(14);
    expect(twoWeeks.getAmountForUnit(TimeUnit.Hour)).toBe(14 * 24);
    expect(twoWeeks.getAmountForUnit(TimeUnit.Minute)).toBe(14 * 24 * 60);
    expect(twoWeeks.getAmountForUnit(TimeUnit.Second)).toBe(14 * 24 * 60 * 60);
    expect(twoWeeks.getAmountForUnit(TimeUnit.Millisecond)).toBe(14 * 24 * 60 * 60 * 1000);
  });

  test('can extract most significant unit', () => {
    expect(
      new TimeDuration(
        4 * 60 * 60 * 1000 + 3 * 60 * 1000 + 5 * 1000 + 689,
        TimeUnit.Millisecond
      ).getMostSignificantUnitOnly()
    ).toEqual(new TimeDuration(4, TimeUnit.Hour));

    expect(new TimeDuration(3 * 60 * 1000 + 5 * 1000 + 689, TimeUnit.Millisecond).getMostSignificantUnitOnly()).toEqual(
      new TimeDuration(3, TimeUnit.Minute)
    );
    expect(new TimeDuration(5 * 1000 + 689, TimeUnit.Millisecond).getMostSignificantUnitOnly()).toEqual(
      new TimeDuration(5, TimeUnit.Second)
    );

    expect(new TimeDuration(689, TimeUnit.Millisecond).getMostSignificantUnitOnly()).toEqual(
      new TimeDuration(689, TimeUnit.Millisecond)
    );
    expect(new TimeDuration(0, TimeUnit.Millisecond).getMostSignificantUnitOnly()).toEqual(
      new TimeDuration(0, TimeUnit.Millisecond)
    );
  });

  test('can parse ISO 8601 duration string', () => {
    let duration = TimeDuration.parse('PT1H');
    expect(duration!.value).toBe(1);
    expect(duration!.unit).toBe(TimeUnit.Hour);

    duration = TimeDuration.parse('P5D');
    expect(duration!.value).toBe(5);
    expect(duration!.unit).toBe(TimeUnit.Day);
  });
});
