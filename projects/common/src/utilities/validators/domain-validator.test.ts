import { areDomainsValid } from './domain-validator';

const VALID_DOMAINS = [
  'google.com',
  'fig.io',
  'hypertrace.org',
  'f4ncy-domain.cc',
  'hypertrace.co.uk',
  'HYPERTRACE.ORG',
  'HYPER.TRACE.ORG',
  'hyper.trace.org'
];
const INVALID_DOMAINS = ['https://google.com', 'google.com/', '123123@.scom', 'g00#.dd', 'www.112323.com'];
describe('Domain validator', () => {
  test('can validate email lists correctly', () => {
    expect(areDomainsValid(VALID_DOMAINS)).toBeTruthy();
    expect(areDomainsValid(INVALID_DOMAINS)).toBeFalsy();
    expect(areDomainsValid(VALID_DOMAINS.concat(INVALID_DOMAINS))).toBeFalsy();
  });
});
