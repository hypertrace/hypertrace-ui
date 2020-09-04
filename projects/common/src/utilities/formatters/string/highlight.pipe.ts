import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'htcHighlight' })
export class HighlightPipe implements PipeTransform {
  public transform(fullText: string, highlightedText: string | undefined): string {
    return highlightedText === undefined ? fullText : fullText.replace(highlightedText, '<mark>$&</mark>');
  }
}
