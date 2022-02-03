import { areDomainsValid } from '@hypertrace/common';

const VALID_DOMAINS = ['google.com', 'fig.io', 'traceable.ai', 'f4ncy-domain.cc'];
const INVALID_DOMAINS = ['https://google.com', 'google.com/', '123123@.scom', 'g00#.dd', 's.ss', 'www.112323.com'];
describe('Domain validator', () => {
  test('can validate email lists correctly', () => {
    expect(areDomainsValid(VALID_DOMAINS)).toBeTruthy();
    expect(areDomainsValid(INVALID_DOMAINS)).toBeFalsy();
    expect(areDomainsValid(VALID_DOMAINS.concat(INVALID_DOMAINS))).toBeFalsy();
  });
});
