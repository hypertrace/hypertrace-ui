import { isValidRegex } from './regex-validator';

const VALID_REGEX = ['2+2', '(2+2) * 3*9'];
const INVALID_REGEX = ['\\', '['];
describe('Regex validator', () => {
  test('can validate regex lists correctly', () => {
    VALID_REGEX.forEach(regex => {
      expect(isValidRegex(regex)).toBeTruthy();
    });
    INVALID_REGEX.forEach(regex => {
      expect(isValidRegex(regex)).toBeFalsy();
    });
  });
});
