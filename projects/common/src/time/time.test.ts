import { Time } from './time';

describe('Time', () => {
  const mockedTime = new Time(8, 30);

  test('can get label', () => {
    expect(mockedTime.label).toBe('8:30 AM');
  });

  test('can get date', () => {
    expect(mockedTime.date).toEqual(new Date(`${new Date().toDateString()} 08:30Z`));
  });

  test('can get ISO String from time', () => {
    expect(mockedTime.toISOString()).toBe('08:30:00.000Z');
  });

  test('can compare two times', () => {
    expect(mockedTime.equals(new Time(8, 30))).toBeTruthy();
    expect(mockedTime.equals(new Time(9, 30))).toBeFalsy();
  });

  test('can return correct Time from a label', () => {
    expect(Time.parse('12:00 AM')).toEqual(new Time(0));
    expect(Time.parse('12:30 PM')).toEqual(new Time(12, 30));
    expect(Time.parse('2:00 AM', true)).toEqual(new Time(2, 0, 0, 0, true));
    expect(Time.parse('2:00 PM', true)).toEqual(new Time(14, 0, 0, 0, true));
  });
});
