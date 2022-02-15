import { isDomainValid } from './domain-validator';

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
const INVALID_DOMAINS = ['.hypertrace.org.', 'hypertrace.42', 'hyper.$trace', 'hyper-trac.e'];
describe('Domain validator', () => {
  test('can validate email lists correctly', () => {
    VALID_DOMAINS.forEach(domain => {
      expect(isDomainValid(domain)).toBeTruthy();
    });
    INVALID_DOMAINS.forEach(domain => {
      expect(isDomainValid(domain)).toBeFalsy();
    });
  });
});
