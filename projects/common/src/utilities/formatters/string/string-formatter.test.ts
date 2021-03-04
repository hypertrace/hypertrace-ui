import {
  displayString,
  getStringsFromCommaSeparatedList,
  titleCaseFromKebabCase,
  titleCaseFromSnakeCase
} from './string-formatter';

describe('String formatter', () => {
  test('can convert from kebab case to title case', () => {
    expect(titleCaseFromKebabCase('my-kebab-case')).toBe('My Kebab Case');
    expect(titleCaseFromKebabCase('single')).toBe('Single');
    expect(titleCaseFromKebabCase('')).toBe('');
  });

  test('can convert from snake case to title case', () => {
    expect(titleCaseFromSnakeCase('my_snake_case')).toBe('My Snake Case');
    expect(titleCaseFromKebabCase('single')).toBe('Single');
    expect(titleCaseFromKebabCase('')).toBe('');
  });

  test('can convert to display string', () => {
    // tslint:disable-next-line: no-null-keyword
    expect(displayString(null)).toBe('-');
    expect(displayString(undefined)).toBe('Unknown');
    expect(displayString('')).toBe('Unknown');
    expect(displayString('value')).toBe('value');
    expect(displayString(15)).toBe('15');
    expect(displayString({})).toBe('Object');
    expect(displayString([undefined])).toBe('[Unknown]');
    expect(displayString(() => 'hi')).toBe('Function');
    expect(displayString(Symbol('test symbol'))).toBe('Symbol(test symbol)');
    expect(displayString(false)).toBe('false');
  });

  test('creates string array correctly from comma separated list', () => {
    expect(getStringsFromCommaSeparatedList('first,second,   third   ')).toEqual(
      expect.arrayContaining(['first', 'second', 'third'])
    );
    expect(getStringsFromCommaSeparatedList('first,second,   ')).toEqual(expect.arrayContaining(['first', 'second']));
    expect(getStringsFromCommaSeparatedList('first')).toEqual(expect.arrayContaining(['first']));
  });
});
