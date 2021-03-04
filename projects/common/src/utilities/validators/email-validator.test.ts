import { areEmailAddressesValid, isEmailAddressValid } from '@hypertrace/common';

describe('Email validator', () => {
  test('can validate email correctly', () => {
    expect(isEmailAddressValid('test@traceable.ai')).toBe(true);
    expect(isEmailAddressValid('test.email@traceable.ai')).toBe(true);
    expect(isEmailAddressValid('test+983tonq@traceable.ai')).toBe(true);
    expect(isEmailAddressValid('test@traceable.')).toBe(false);
    expect(isEmailAddressValid('test')).toBe(false);
    expect(isEmailAddressValid('test@traceable-')).toBe(false);
    expect(isEmailAddressValid('tes\t@traceable-')).toBe(false);
    expect(isEmailAddressValid('test@@traceable.ai')).toBe(false);
    expect(isEmailAddressValid('test@@traceable.ai')).toBe(false);
  });

  test('can validate email lists correctly', () => {
    expect(areEmailAddressesValid(['test@traceable.ai', 'test.email@traceable.ai'])).toBe(true);
    expect(areEmailAddressesValid(['test@traceable.ai', 'test.email@@traceable.ai'])).toBe(false);
  });
});
