import { HighlightPipe } from './highlight.pipe';

describe('Highlight pipe', () => {
  let pipe: HighlightPipe;

  beforeEach(() => {
    pipe = new HighlightPipe();
  });

  test('highlights the full string correctly when highlight type is not explicitly supplied', () => {
    expect(pipe.transform('full text to test highlight on', undefined)).toBe(
      '<mark>full text to test highlight on</mark>'
    );
  });

  test('highlights part with mark correctly', () => {
    expect(pipe.transform('full text to test highlight on', { text: 'highlight', highlightType: 'mark' })).toBe(
      'full text to test <mark>highlight</mark> on'
    );
  });

  test('highlights part with bold correctly', () => {
    expect(pipe.transform('full text to test highlight on', { text: 'highlight', highlightType: 'bold' })).toBe(
      'full text to test <b>highlight</b> on'
    );
  });

  test('highlights part with italic correctly', () => {
    expect(pipe.transform('full text to test highlight on', { text: 'highlight', highlightType: 'italic' })).toBe(
      'full text to test <i>highlight</i> on'
    );
  });

  test('highlights with an array of highlightConfig correctly', () => {
    expect(
      pipe.transform('full text to test highlight on', [
        { text: 'text', highlightType: 'bold' },
        { text: 'test', highlightType: 'italic' }
      ])
    ).toBe('full <b>text</b> to <i>test</i> highlight on');
  });
});
