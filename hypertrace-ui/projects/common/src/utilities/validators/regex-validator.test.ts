import { isValidRegex } from './regex-validator';

describe('Regex validator', () => {
  const VALID_REGEX = ['2+2', '(2+2) * 3*9'];
  const INVALID_REGEX = ['\\', '['];
  test('valid regex should return true', () => {
    VALID_REGEX.forEach(regex => {
      expect(isValidRegex(regex)).toBe(true);
    });
  });

  test('invalid regex should return false', () => {
    INVALID_REGEX.forEach(regex => {
      expect(isValidRegex(regex)).toBe(false);
    });
  });
});
