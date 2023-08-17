import { DateFormatMode, DateFormatter } from './date-formatter';

describe('Date formatter', () => {
  /*
   * Note: Tests run local to zulu time, so unless a different timezone is provided, parsing the
   *       string below will always convert to timezone offset of 0 with time adjusted by the offset.
   */
  const dateString = '2021-08-19T14:23:56.789-08:30';

  test('can format a date string', () => {
    expect(new DateFormatter().format(dateString)).toEqual('19 Aug 2021 10:53 PM');
  });

  test('can format a date string with month and year only', () => {
    expect(
      new DateFormatter({
        mode: DateFormatMode.MonthAndYearOnly
      }).format(dateString)
    ).toEqual('Aug 21');
  });

  test('can format a date string with full month and year only', () => {
    expect(
      new DateFormatter({
        mode: DateFormatMode.FullMonthAndYearOnly
      }).format(dateString)
    ).toEqual('August 2021');
  });

  test('can format a date string with day, full month, year, and time with time zone', () => {
    expect(
      new DateFormatter({
        mode: DateFormatMode.DateWithYearAndTimeWithTimeZone
      }).format(dateString)
    ).toEqual('19 Aug 2021 10:53 PM GMT+00:00');
  });

  test('can format a date string with time and offset time zone', () => {
    expect(
      new DateFormatter({
        mode: DateFormatMode.TimeWithTimeZoneOffset
      }).format(dateString)
    ).toEqual('22:53:56Z');

    expect(
      new DateFormatter({
        mode: DateFormatMode.TimeWithTimeZoneOffset
      }).format(dateString, 'PST')
    ).toEqual('14:53:56-08:00');
  });
});
