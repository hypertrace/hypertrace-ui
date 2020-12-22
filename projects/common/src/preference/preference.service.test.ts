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
      cold('-s-b-n-o-a|', {
        s: () => service.set('foo', 'a'),
        b: () => service.set('foo', false),
        n: () => service.set('foo', 42.3),
        o: () =>
          service.set('foo', {
            first: 'first',
            second: ['first', 'second', 3, true],
            third: 1,
            fifth: true,
            sixth: undefined,
            seventh: null
          }),
        a: () => service.set('foo', ['first', 2, null, false, { test: 'test' }, undefined, 'null', 'undefined'])
      }).subscribe(update => update());

      expectObservable(service.get('foo', 'default')).toBe('ds-b-n-o-a', {
        d: 'default',
        s: 'a',
        b: false,
        n: 42.3,
        o: {
          first: 'first',
          second: ['first', 'second', 3, true],
          third: 1,
          fifth: true,
          // Note that 'sixth: undefined' not included
          seventh: null
        },
        a: ['first', 2, null, false, { test: 'test' }, null, 'null', 'undefined'] // Note the undefined -> null
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
