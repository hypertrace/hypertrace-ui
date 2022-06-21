import { isValidRegex } from './regex-validator';

const VALID_REGEX = ['2+2', '(2+2) * 3*9'];
const INVALID_REGEX = ['\\', '['];
describe('Domain validator', () => {
  test('can validate email lists correctly', () => {
    VALID_REGEX.forEach(domain => {
      expect(isValidRegex(domain)).toBeTruthy();
    });
    INVALID_REGEX.forEach(domain => {
      expect(isValidRegex(domain)).toBeFalsy();
    });
  });
});
