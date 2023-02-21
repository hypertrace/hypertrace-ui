import { DateFormatMode, DateFormatter } from './date-formatter';

describe('Date formatter', () => {
  const dateString = '2021-08-19T13:02:03.456Z';

  test('can format a date string', () => {
    expect(new DateFormatter().format(dateString)).toEqual('19 Aug 2021 1:02 PM');
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
    ).toEqual('19 Aug 2021 1:02 PM GMT-00:00');
  });

  test('can format a date string with and time with offset time zone', () => {
    expect(
      new DateFormatter({
        mode: DateFormatMode.TimeWithTimeZoneOffset
      }).format(dateString)
    ).toEqual('01:02:03+00:00');
  });
});
