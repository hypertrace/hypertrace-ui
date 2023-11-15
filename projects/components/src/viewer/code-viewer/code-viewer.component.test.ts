import { Color } from '@hypertrace/common';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { CopyToClipboardComponent } from '../../copy-to-clipboard/copy-to-clipboard.component';
import { DownloadFileComponent } from '../../download-file/download-file.component';
import { MessageDisplayComponent } from '../../message-display/message-display.component';
import { SearchBoxComponent } from '../../search-box/search-box.component';
import { CodeViewerComponent } from './code-viewer.component';
import { SyntaxHighlighterService } from './syntax-highlighter/syntax-highlighter.service';

describe('Code Viewer Component', () => {
  const createComponent = createComponentFactory({
    component: CodeViewerComponent,
    declarations: [
      MockComponent(SearchBoxComponent),
      MockComponent(DownloadFileComponent),
      MockComponent(CopyToClipboardComponent),
      MockComponent(MessageDisplayComponent),
    ],
    providers: [
      mockProvider(SyntaxHighlighterService, {
        highlight: jest.fn().mockReturnValueOnce('{').mockReturnValueOnce(`"key": "value"`).mockReturnValueOnce('}'),
      }),
    ],
    shallow: true,
  });
  const code = `{\n "key": "value" \n }`;
  const downloadFileName = 'code.json';

  test('should render everything correctly', () => {
    const spectator = createComponent({
      props: {
        code: '',
      },
    });
    expect(spectator.query('.line-numbers')).not.toExist();
    expect(spectator.query('.code-lines')).not.toExist();
    expect(spectator.query(MessageDisplayComponent)).toExist();

    // Set code
    spectator.setInput({
      code: code,
    });

    expect(spectator.query('.code-viewer')).toExist();
    expect(spectator.query(SearchBoxComponent)).toExist();
    expect(spectator.query(DownloadFileComponent)).not.toExist();
    expect(spectator.query(CopyToClipboardComponent)).not.toExist();
    expect(spectator.query('.title')).toHaveText('Code Viewer');
    expect(spectator.queryAll('.line-number').length).toBe(3);
    expect(spectator.queryAll('.code-line').length).toBe(3);
    expect(spectator.queryAll('.line-number.line-highlight').length).toBe(0);
    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(0);

    // Highlight text (with string input)
    spectator.setInput({
      highlightText: 'key',
    });

    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(1);
    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(1);

    // Highlight text (with string[] input)
    spectator.setInput({
      highlightText: ['key'],
    });

    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(1);
    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(1);

    // Highlight text (with RegExp input)
    spectator.setInput({
      highlightText: new RegExp('key'),
    });

    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(1);
    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(1);

    // Download
    spectator.setInput({
      downloadFileName: downloadFileName,
    });

    expect(spectator.query(DownloadFileComponent)).toExist();
    expect(spectator.query(DownloadFileComponent)?.metadata?.fileName).toBe(downloadFileName);

    // Copy to clipboard
    spectator.setInput({
      enableCopy: true,
    });

    expect(spectator.query(CopyToClipboardComponent)).toExist();

    // Search
    spectator.triggerEventHandler(SearchBoxComponent, 'valueChange', 'e');
    const searchElements = spectator.queryAll('.bg-searched');
    expect(searchElements.length).toBe(2);
    expect(searchElements[0]).toHaveStyle({ border: `1px solid ${Color.Gray6}` });
    expect(searchElements[1]).toHaveStyle({ border: undefined });

    // Search Submit
    spectator.triggerEventHandler(SearchBoxComponent, 'submit', 'e');
    expect(searchElements[0]).toHaveStyle({ border: undefined });
    expect(searchElements[1]).toHaveStyle({ border: `1px solid ${Color.Gray6}` });
  });
});
