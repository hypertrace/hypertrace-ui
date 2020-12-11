import { Pipe, PipeTransform } from '@angular/core';
import { isArray } from 'lodash-es';
import { assertUnreachable } from '../../lang/lang-utils';

@Pipe({ name: 'htHighlight' })
export class HighlightPipe implements PipeTransform {
  public transform(
    fullText: string,
    highlightedText: string | undefined | TextHighlightConfig[],
    highlightType: HighlightType = 'mark'
  ): string {
    if (isArray(highlightedText)) {
      let textWithHighlight = fullText;
      highlightedText.forEach(highlightConfig => {
        const highlightHtmlTag = getHtmlTagForHighlightType(highlightConfig.highlightType);
        textWithHighlight = textWithHighlight.replace(
          highlightConfig.text,
          `<${highlightHtmlTag}>$&</${highlightHtmlTag}>`
        );
      });

      return textWithHighlight;
    }

    const htmlTag = getHtmlTagForHighlightType(highlightType);

    return highlightedText === undefined ? fullText : fullText.replace(highlightedText, `<${htmlTag}>$&</${htmlTag}>`);
  }
}

export type HighlightType = 'mark' | 'bold' | 'italic';

export interface TextHighlightConfig {
  text: string;
  highlightType: HighlightType;
}

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
