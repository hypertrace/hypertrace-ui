import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { PreferenceService } from './preference.service';

describe('Preference Service', () => {
  const serviceFactory = createServiceFactory({ service: PreferenceService });

  afterEach(() => {
    localStorage.clear();
  });

  test('allows setting and retrieving preferences of primitive types', () => {
    const service = serviceFactory().service;

    runFakeRxjs(({ expectObservable, cold }) => {
      cold('-s-b-n|', {
        s: () => service.set('foo', 'a'),
        b: () => service.set('foo', false),
        n: () => service.set('foo', 42.3)
      }).subscribe(update => update());

      expectObservable(service.get('foo', 'default')).toBe('ds-b-n', {
        d: 'default',
        s: 'a',
        b: false,
        n: 42.3
      });
    });
  });

  test('throws if default value is not provided', () => {
    const service = serviceFactory().service;

    runFakeRxjs(({ expectObservable, cold }) => {
      cold('-s|', {
        s: () => service.set('foo', 'a')
      }).subscribe(update => update());

      expectObservable(service.get('foo')).toBe(
        '#',
        undefined,
        Error('No value found or default provided for preferenceKey: foo')
      );
    });
  });
});
