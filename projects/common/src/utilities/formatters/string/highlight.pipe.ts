import { Pipe, PipeTransform } from '@angular/core';
import { assertUnreachable } from '../../lang/lang-utils';

@Pipe({ name: 'htHighlight' })
export class HighlightPipe implements PipeTransform {
  public transform(
    fullText: string,
    highlightedText: string | undefined,
    highlightType: HighlightType = 'mark'
  ): string {
    const htmlTag = getHtmlTagForHighlightType(highlightType);

    return highlightedText === undefined ? fullText : fullText.replace(highlightedText, `<${htmlTag}>$&</${htmlTag}>`);
  }
}

type HighlightType = 'mark' | 'bold' | 'italic';

const getHtmlTagForHighlightType = (type: HighlightType): string | undefined => {
  switch (type) {
    case 'bold':
      return 'b';
    case 'mark':
      return 'mark';
    case 'italic':
      return 'i';
    default:
      assertUnreachable(type);
  }
};
