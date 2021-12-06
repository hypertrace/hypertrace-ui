import { DateFormatter } from './date-formatter';

describe('Date formatter', () => {
  const dateString = '2021-08-19T23:35:45.861Z';

  test('can format a date string', () => {
    expect(new DateFormatter().format(dateString)).toEqual('19 Aug 2021 11:35 PM');
  });
});
