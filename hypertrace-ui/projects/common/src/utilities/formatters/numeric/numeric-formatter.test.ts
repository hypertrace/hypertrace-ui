import { floatFormatter, integerFormatter } from './numeric-formatter';

describe('Integer formatter', () => {
  test('can do basic scaling', () => {
    expect(integerFormatter.format(12)).toEqual('12');
    expect(integerFormatter.format(123)).toEqual('123');
    expect(integerFormatter.format(1234)).toEqual('1.23K');
    expect(integerFormatter.format(1000)).toEqual('1.00K');
    expect(integerFormatter.format(12345)).toEqual('12.35K');
    expect(integerFormatter.format(123456)).toEqual('123.46K');
    expect(integerFormatter.format(1234567)).toEqual('1.23M');
    expect(integerFormatter.format(12345678)).toEqual('12.35M');
    expect(integerFormatter.format(123456789)).toEqual('123.46M');
    expect(integerFormatter.format(1234567890)).toEqual('1.23B');
    expect(integerFormatter.format(1234567890000)).toEqual('1.23T');
  });

  test('rounds float values', () => {
    expect(integerFormatter.format(100.5)).toEqual('101');
    expect(integerFormatter.format(100.499)).toEqual('100');
  });
});

describe('Float formatter', () => {
  test('can do basic scaling', () => {
    expect(floatFormatter.format(1.2)).toEqual('1.20');
    expect(floatFormatter.format(1.23)).toEqual('1.23');
    expect(floatFormatter.format(1.234)).toEqual('1.23');
    expect(floatFormatter.format(1.23e-5)).toEqual('0.00');
    expect(floatFormatter.format(10)).toEqual('10.00');
    expect(floatFormatter.format(12.345)).toEqual('12.35');
    expect(floatFormatter.format(123.456)).toEqual('123.46');
    expect(floatFormatter.format(1234.567)).toEqual('1.23K');
    expect(floatFormatter.format(12345.678)).toEqual('12.35K');
    expect(floatFormatter.format(123456.789)).toEqual('123.46K');
    expect(floatFormatter.format(1234567.89)).toEqual('1.23M');
  });
});
