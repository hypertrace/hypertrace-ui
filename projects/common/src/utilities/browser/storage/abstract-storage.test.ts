import { runFakeRxjs } from '@hypertrace/test-utils';
import { AbstractStorage } from './abstract-storage';

describe('Abstract storage', () => {
  let storage: AbstractStorage;

  beforeEach(() => {
    storage = new (class extends AbstractStorage {})(localStorage);
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should support basic crud operations', () => {
    expect(storage.contains('foo')).toBe(false);

    storage.set('foo', 'fooValue');
    expect(storage.contains('foo')).toBe(true);
    expect(storage.get('foo')).toBe('fooValue');

    storage.delete('foo');
    expect(storage.contains('foo')).toBe(false);
    expect(storage.get('foo')).toBe(undefined);
  });

  test('should allow watching for changes in a stored value', () => {
    runFakeRxjs(({ expectObservable, cold }) => {
      cold('-a-b-u-c-|', {
        a: () => storage.set('foo', 'a'),
        b: () => storage.set('bar', 'b'),
        c: () => storage.set('foo', 'c'),
        u: () => storage.delete('foo')
      }).subscribe(update => update());

      expectObservable(storage.watch('foo')).toBe('ua---u-c-', { u: undefined, a: 'a', c: 'c' });
      expectObservable(storage.watch('bar')).toBe('u--b-----', { u: undefined, b: 'b' });
    });
  });
});
