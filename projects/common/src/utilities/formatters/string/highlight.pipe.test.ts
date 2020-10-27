import { HighlightPipe } from './highlight.pipe';

describe('Highlight pipe', () => {
  let pipe: HighlightPipe;

  beforeEach(() => {
    pipe = new HighlightPipe();
  });

  test('highlights with default type correctly when highlight type is not explicitly supplied', () => {
    expect(pipe.transform('full text to test highlight on', 'highlight')).toBe(
      'full text to test <mark>highlight</mark> on'
    );
  });

  test('highlights with bold correctly', () => {
    expect(pipe.transform('full text to test highlight on', 'highlight', 'bold')).toBe(
      'full text to test <b>highlight</b> on'
    );
  });

  test('highlights with italic correctly', () => {
    expect(pipe.transform('full text to test highlight on', 'highlight', 'italic')).toBe(
      'full text to test <i>highlight</i> on'
    );
  });
});
