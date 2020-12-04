import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { SnippetViewerComponent } from './snippet-viewer.component';
import { SnippetViewerModule } from './snippet-viewer.module';

describe('Snippet Viewer Component', () => {
  let spectator: Spectator<SnippetViewerComponent>;
  const createHost = createHostFactory({
    declareComponent: false,
    component: SnippetViewerComponent,
    imports: [SnippetViewerModule, RouterTestingModule, HttpClientTestingModule]
  });

  test('should display snippet in multi lines with line numbers', () => {
    const snippet =
      'This is a text snippet line 1\n\
    This is a text snippet line 2\n\
    This is a text snippet line 3\n\
    This is a text snippet line 4\n\
    This is a text snippet line 5\n\
    This is a text snippet line 6\n\
    This is a text snippet line 7\n\
    This is a text snippet line 8\n\
    This is a text snippet line 9';

    spectator = createHost(`<ht-snippet-viewer [snippet]="snippet"></ht-snippet-viewer>`, {
      hostProps: {
        snippet: snippet
      }
    });

    const lineCountElements = spectator.queryAll('.line-number');
    expect(lineCountElements.length).toEqual(9);

    lineCountElements.forEach((lineCountElement, index) => {
      const lineNumber = index + 1;
      expect(lineCountElement).toHaveText(`${lineNumber}`);
    });

    const linesContentElements = spectator.queryAll('.content');
    expect(linesContentElements.length).toEqual(9);

    linesContentElements.forEach((linesContentElement, index) => {
      const lineNumber = index + 1;
      expect(linesContentElement).toHaveText(`This is a text snippet line ${lineNumber}`);
    });
  });
});
