import { NumberCoercer } from './number-coercer';

describe('Number coercer', () => {
  const basicCoercer = new NumberCoercer();

  test('coerces number', () => {
    expect(basicCoercer.coerce(1)).toBe(1);
    expect(basicCoercer.coerce(0)).toBe(0);
    expect(basicCoercer.coerce(NaN)).toBeUndefined();
  });

  test('coerces string', () => {
    expect(basicCoercer.coerce('3')).toBe(3);

    expect(basicCoercer.coerce('4.2')).toBe(4.2);

    expect(basicCoercer.coerce('0xff')).toBe(255);
  });

  test('coerces valueOf', () => {
    const expected = 1554964238061;
    expect(basicCoercer.coerce(new Date(1554964238061))).toBe(expected);
    expect(basicCoercer.coerce({ valueOf: () => expected })).toBe(expected);
    expect(basicCoercer.coerce({ valueOf: () => '1554964238061' })).toBe(expected);
  });

  test('coerces property in object', () => {
    const objectCoercer = new NumberCoercer({
      extractObjectKeys: ['test', 'second']
    });

    expect(objectCoercer.coerce({ test: 10 })).toBe(10);

    expect(objectCoercer.coerce({ second: 20 })).toBe(20);

    // Should take first found
    expect(objectCoercer.coerce({ test: 10, second: 20 })).toBe(10);
  });

  test('coerces index in array', () => {
    const arrayCoercer = new NumberCoercer({
      extractArrayIndices: [0, 1]
    });

    expect(arrayCoercer.coerce([])).toBeUndefined();
    expect(arrayCoercer.coerce([10])).toBe(10);
    expect(arrayCoercer.coerce([undefined, 20])).toBe(20);
    // Should take first found
    expect(arrayCoercer.coerce([10, 20])).toBe(10);
  });

  test('return undefined if no coercion', () => {
    expect(basicCoercer.coerce({})).toBeUndefined();
    expect(basicCoercer.coerce('test')).toBeUndefined();
  });

  test('returns default value if no coercion and default value provided', () => {
    const defaultingCoercer = new NumberCoercer({
      defaultValue: 0
    });
    expect(defaultingCoercer.coerce({})).toBe(0);
  });

  test('determines if coercion possible', () => {
    expect(basicCoercer.canCoerce('test')).toBe(false);
    expect(basicCoercer.canCoerce(12)).toBe(true);
    expect(basicCoercer.canCoerce('2.3')).toBe(true);
  });

  test('disregards array if too many values', () => {
    const maxArrayLengthCoercer = new NumberCoercer({
      maxArrayLength: 2,
      extractArrayIndices: [0]
    });
    expect(maxArrayLengthCoercer.coerce([1, 2, 3])).toBeUndefined();
    expect(maxArrayLengthCoercer.coerce([1, 2])).toBe(1);
  });

  test('ignores self if configured', () => {
    const nonSelfCoercer = new NumberCoercer({
      useSelf: false,
      extractArrayIndices: [0]
    });

    expect(nonSelfCoercer.coerce(1)).toBeUndefined();

    expect(nonSelfCoercer.coerce([1])).toBe(1);
  });
});
