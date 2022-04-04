import { runFakeRxjs } from '@hypertrace/test-utils';
import { AbstractStorage } from './abstract-storage';
import { DictionaryStorageImpl } from './dictionary-storage-impl';

describe('Abstract storage', () => {
  let storage: AbstractStorage;

  beforeEach(() => {
    storage = new (class extends AbstractStorage {})(new DictionaryStorageImpl());
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

  test('should support scoped storage with no fallback', () => {
    const globalDictionary = new DictionaryStorageImpl({ foo: 'bad-foo' });

    const scopedStorage = new (class extends AbstractStorage {})(globalDictionary, {
      scopeKey: 'test-scope'
    });

    expect(scopedStorage.get('foo')).toBeUndefined();
    expect(scopedStorage.contains('foo')).toBe(false);
    scopedStorage.set('foo', 'bar');
    expect(scopedStorage.get('foo')).toBe('bar');
    expect(globalDictionary.toJsonString()).toBe('{"foo":"bad-foo","test-scope":"{\\"foo\\":\\"bar\\"}"}');
    expect(scopedStorage.contains('foo')).toBe(true);
    scopedStorage.set('foo', 'baz');
    expect(globalDictionary.toJsonString()).toBe('{"foo":"bad-foo","test-scope":"{\\"foo\\":\\"baz\\"}"}');
    scopedStorage.set('a', 'b');
    scopedStorage.delete('foo');
    expect(globalDictionary.toJsonString()).toBe('{"foo":"bad-foo","test-scope":"{\\"a\\":\\"b\\"}"}');
  });

  test('should support scoped storage with readonly fallback', () => {
    const globalDictionary = new DictionaryStorageImpl({ foo: 'original-foo' });

    const scopedStorage = new (class extends AbstractStorage {})(globalDictionary, {
      scopeKey: 'test-scope',
      fallbackPolicy: 'read-only'
    });

    expect(scopedStorage.get('foo')).toBe('original-foo');
    expect(scopedStorage.contains('foo')).toBe(true);
    scopedStorage.set('foo', 'bar');
    expect(scopedStorage.get('foo')).toBe('bar');
    expect(globalDictionary.toJsonString()).toBe('{"foo":"original-foo","test-scope":"{\\"foo\\":\\"bar\\"}"}');
    scopedStorage.delete('foo');
    expect(scopedStorage.contains('foo')).toBe(true);
    expect(scopedStorage.get('foo')).toBe('original-foo');
    expect(globalDictionary.toJsonString()).toBe('{"foo":"original-foo","test-scope":"{}"}');
  });

  test('should migrate on read if configured', () => {
    const globalDictionary = new DictionaryStorageImpl({ foo: 'original-foo' });

    const scopedStorage = new (class extends AbstractStorage {})(globalDictionary, {
      scopeKey: 'test-scope',
      fallbackPolicy: 'read-and-migrate'
    });

    expect(scopedStorage.get('foo')).toBe('original-foo');
    expect(scopedStorage.contains('foo')).toBe(true);
    expect(globalDictionary.toJsonString()).toBe('{"test-scope":"{\\"foo\\":\\"original-foo\\"}"}');

    scopedStorage.delete('foo');
    expect(scopedStorage.contains('foo')).toBe(false);
    expect(globalDictionary.toJsonString()).toBe('{"test-scope":"{}"}');
  });
});
