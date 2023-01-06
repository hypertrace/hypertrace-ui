import { ExtractValuesPipe } from '@hypertrace/common';

describe('ExtractValuesPipe', () => {
  const pipe = new ExtractValuesPipe();

  test('should extract values correctly from an array of objects', () => {
    expect(
      pipe.transform(
        [
          { a: 1, b: 2 },
          { a: 3, b: 4 },
          { a: 3, b: 6 }
        ],
        'a'
      )
    ).toEqual([1, 3]);
    expect(
      pipe.transform(
        [
          { a: 1, b: 2 },
          { a: 3, b: 4 },
          { a: 3, b: 6 }
        ],
        'a',
        false
      )
    ).toEqual([1, 3, 3]);
    expect(pipe.transform(['unsupported-input'], 'a')).toEqual([]);
  });
});
