import {
  DurationDisplayMode,
  DurationDisplayTextType,
  DurationFormatOptions,
  durationFormatter
} from './duration-formatter';

describe('DurationFormatter', () => {
  test('can format duration For days only mode', () => {
    const options1: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysOnly,
      textType: DurationDisplayTextType.Full
    };

    const options2: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysOnly,
      textType: DurationDisplayTextType.Short
    };

    expect(durationFormatter(0, options1)).toEqual('0 days');
    expect(durationFormatter(0, options2)).toEqual('0d');
    expect(durationFormatter(87300000, options1)).toEqual('1 days');
    expect(durationFormatter(87300000, options2)).toEqual('1d');
  });

  test('can format duration For days and hours mode', () => {
    const options1: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysAndHours,
      textType: DurationDisplayTextType.Full
    };

    const options2: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysAndHours,
      textType: DurationDisplayTextType.Short
    };

    expect(durationFormatter(0, options1)).toEqual('0 hours');
    expect(durationFormatter(0, options2)).toEqual('0h');
    expect(durationFormatter(3600001, options1)).toEqual('1 hours');
    expect(durationFormatter(3600001, options2)).toEqual('1h');
    expect(durationFormatter(87300000, options1)).toEqual('1 days 0 hours');
    expect(durationFormatter(87300000, options2)).toEqual('1d 0h');
  });

  test('can format duration For days, hours and minutes mode', () => {
    const options1: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysHoursAndMinutes,
      textType: DurationDisplayTextType.Full
    };

    const options2: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysHoursAndMinutes,
      textType: DurationDisplayTextType.Short
    };

    expect(durationFormatter(0, options1)).toEqual('0 minutes');
    expect(durationFormatter(0, options2)).toEqual('0m');
    expect(durationFormatter(3600001, options1)).toEqual('1 hours 0 minutes');
    expect(durationFormatter(3600001, options2)).toEqual('1h 0m');
    expect(durationFormatter(87300000, options1)).toEqual('1 days 0 hours 15 minutes');
    expect(durationFormatter(87300000, options2)).toEqual('1d 0h 15m');
  });

  test('can format duration For days, hours, minutes and seconds mode', () => {
    const options1: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysHoursAndMinutes,
      textType: DurationDisplayTextType.Full
    };

    const options2: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysHoursAndMinutes,
      textType: DurationDisplayTextType.Short
    };

    expect(durationFormatter(0, options1)).toEqual('0 minutes');
    expect(durationFormatter(0, options2)).toEqual('0m');
    expect(durationFormatter(3600001, options1)).toEqual('1 hours 0 minutes');
    expect(durationFormatter(3600001, options2)).toEqual('1h 0m');
    expect(durationFormatter(87300000, options1)).toEqual('1 days 0 hours 15 minutes');
    expect(durationFormatter(87300000, options2)).toEqual('1d 0h 15m');
  });

  test('can format duration For days, hours, minutes, seconds and milliseconds mode', () => {
    const options1: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysOnly,
      textType: DurationDisplayTextType.Full
    };

    const options2: DurationFormatOptions = {
      mode: DurationDisplayMode.DaysOnly,
      textType: DurationDisplayTextType.Short
    };

    expect(durationFormatter(0, options1)).toEqual('0 days');
    expect(durationFormatter(0, options2)).toEqual('0d');
    expect(durationFormatter(87300000, options1)).toEqual('1 days');
    expect(durationFormatter(87300000, options2)).toEqual('1d');
  });
});
