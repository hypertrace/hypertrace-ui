import { createServiceFactory } from '@ngneat/spectator/jest';
import { CodeLanguage } from '../code-language';
import { SyntaxHighlighterService } from './syntax-highlighter.service';

describe('Syntax Highlighter Service', () => {
  const createService = createServiceFactory({
    service: SyntaxHighlighterService,
  });

  test('should return correct highlighted HTML string', () => {
    const spectator = createService();
    expect(spectator.service.highlight('test: test-1', CodeLanguage.Yaml)).toBe(
      '<span class="hljs-attr">test:</span> <span class="hljs-string">test-1</span>',
    );
  });
});
