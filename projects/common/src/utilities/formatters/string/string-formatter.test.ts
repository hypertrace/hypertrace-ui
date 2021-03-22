import { displayString, getStringsFromCommaSeparatedList } from './string-formatter';

describe('String formatter', () => {
  test('can convert to display string', () => {
    // tslint:disable-next-line: no-null-keyword
    expect(displayString(null)).toBe('-');
    expect(displayString(undefined)).toBe('-');
    expect(displayString('')).toBe('');
    expect(displayString('value')).toBe('value');
    expect(displayString(15)).toBe('15');
    expect(displayString({})).toBe('Object');
    expect(displayString([undefined])).toBe('[-]');
    expect(displayString(() => 'hi')).toBe('Function');
    expect(displayString(Symbol('test symbol'))).toBe('Symbol(test symbol)');
    expect(displayString(false)).toBe('false');
  });

  test('creates string array correctly from comma separated list', () => {
    expect(getStringsFromCommaSeparatedList('first,second,   third   ')).toEqual(
      expect.arrayContaining(['first', 'second', 'third'])
    );
    expect(getStringsFromCommaSeparatedList('first,second,   ')).toEqual(['first', 'second']);
    expect(getStringsFromCommaSeparatedList('first')).toEqual(['first']);
  });
});
