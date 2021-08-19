import { DisplayDatePipe } from './display-date.pipe';

describe('Display date pipe', () => {
  const dateString = '2021-08-19T23:35:45.861Z';

  test('can render a formatted string', () => {
    expect(new DisplayDatePipe().transform(dateString)).toEqual('19 Aug 2021 11:35 PM');
  });
});
