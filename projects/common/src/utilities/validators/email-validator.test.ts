import { areEmailAddressesValid, isEmailAddressValid } from '@hypertrace/common';

describe('Email validator', () => {
  test('can validate email correctly', () => {
    expect(isEmailAddressValid('test@test.ai')).toBe(true);
    expect(isEmailAddressValid('test.email@test.ai')).toBe(true);
    expect(isEmailAddressValid('test+983tonq@test.ai')).toBe(true);
    expect(isEmailAddressValid('test@test.')).toBe(false);
    expect(isEmailAddressValid('test')).toBe(false);
    expect(isEmailAddressValid('test@test-')).toBe(false);
    expect(isEmailAddressValid('tes\t@test-')).toBe(false);
    expect(isEmailAddressValid('test@@test.ai')).toBe(false);
    expect(isEmailAddressValid('test@@test.ai')).toBe(false);
  });

  test('can validate email lists correctly', () => {
    expect(areEmailAddressesValid(['test@test.ai', 'test.email@test.ai'])).toBe(true);
    expect(areEmailAddressesValid(['test@test.ai', 'test.email@@test.ai'])).toBe(false);
  });
});
