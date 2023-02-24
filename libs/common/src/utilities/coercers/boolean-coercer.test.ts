import { BooleanCoercer } from './boolean-coercer';

describe('Boolean coercer', () => {
  const booleanCoercer = new BooleanCoercer();

  test('coerces true and false as strings', () => {
    expect(booleanCoercer.coerce('true')).toBe(true);
    expect(booleanCoercer.coerce('TRUE')).toBe(true);
    expect(booleanCoercer.coerce('tRUe')).toBe(true);
    expect(booleanCoercer.coerce('false')).toBe(false);
    expect(booleanCoercer.coerce('FALSE')).toBe(false);
    expect(booleanCoercer.coerce('fAlse')).toBe(false);
  });

  test('coerces values based on truthiness if not a boolean string', () => {
    expect(booleanCoercer.coerce('')).toBe(false);
    expect(booleanCoercer.coerce(false)).toBe(false);
    expect(booleanCoercer.coerce(0)).toBe(false);
    expect(booleanCoercer.coerce(undefined)).toBe(false);
    // tslint:disable-next-line: no-null-keyword
    expect(booleanCoercer.coerce(null)).toBe(false);
    expect(booleanCoercer.coerce(100)).toBe(true);
    expect(booleanCoercer.coerce('foo')).toBe(true);
    expect(booleanCoercer.coerce({})).toBe(true);
    expect(booleanCoercer.coerce([])).toBe(true);
  });
});
