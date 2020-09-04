import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'htHighlight' })
export class HighlightPipe implements PipeTransform {
  public transform(fullText: string, highlightedText: string | undefined): string {
    return highlightedText === undefined ? fullText : fullText.replace(highlightedText, '<mark>$&</mark>');
  }
}
