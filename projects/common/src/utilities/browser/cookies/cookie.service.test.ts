import { createServiceFactory } from '@ngneat/spectator/jest';
import { CookieService } from './cookie.service';

describe('Cookie service', () => {
  const serviceBuilder = createServiceFactory(CookieService);
  let spectator: ReturnType<typeof serviceBuilder>;

  beforeEach(() => {
    spectator = serviceBuilder();
    document.cookie = 'foo=fooValue';
    document.cookie = `bar=${encodeURIComponent('https://www.google.com')}`;
  });

  test('can get a cookie', () => {
    expect(spectator.service.get('bar')).toBe('https://www.google.com');
  });

  test('can get all cookies', () => {
    expect(spectator.service.getAll()).toEqual(
      new Map([
        ['foo', 'fooValue'],
        ['bar', 'https://www.google.com']
      ])
    );
  });
  test("returns undefined if requesting a cookie that doesn't exist", () => {
    expect(spectator.service.get('non-existent')).toBeUndefined();
  });
});
