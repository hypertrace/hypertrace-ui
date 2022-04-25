import { DictionaryStorageImpl } from './dictionary-storage-impl';

describe('Dictionary Storage impl', () => {
  test('can read and write values', () => {
    const storage = new DictionaryStorageImpl();

    storage.setItem('foo', 'bar');
    expect(storage.getItem('foo')).toBe('bar');
    expect(storage.getItem('non-existent')).toBeNull();
    storage.setItem('foo', 'bar-update');
    expect(storage.getItem('foo')).toBe('bar-update');
  });

  test('can detect length', () => {
    const storage = new DictionaryStorageImpl();
    expect(storage.length).toBe(0);
    storage.setItem('foo', 'bar');
    expect(storage.length).toBe(1);

    storage.setItem('a', 'b');
    expect(storage.length).toBe(2);
    storage.removeItem('a');
    expect(storage.length).toBe(1);
    storage.clear();
    expect(storage.length).toBe(0);
  });

  test('can be initialized from a dictionary', () => {
    const storage = new DictionaryStorageImpl({ foo: 'bar', a: 'b' });
    storage.setItem('x', 'y');
    expect(storage.length).toBe(3);

    expect(storage.getItem('foo')).toBe('bar');
    expect(storage.getItem('a')).toBe('b');
    expect(storage.getItem('x')).toBe('y');
  });

  test('can serialize to and from JSON string', () => {
    const storageFromDictionary = new DictionaryStorageImpl({ foo: 'bar', a: 'b' });
    storageFromDictionary.setItem('c', 'd');
    storageFromDictionary.removeItem('a');
    expect(storageFromDictionary.toJsonString()).toBe('{"foo":"bar","c":"d"}');

    const storageFromString = DictionaryStorageImpl.fromString('{"foo":"bar","a":"b"}');
    expect(storageFromString.length).toBe(2);
    expect(storageFromString.getItem('foo')).toBe('bar');
    expect(storageFromString.getItem('a')).toBe('b');
  });
});
