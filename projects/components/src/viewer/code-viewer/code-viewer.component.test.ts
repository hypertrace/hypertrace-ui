import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { CopyToClipboardComponent } from '../../copy-to-clipboard/copy-to-clipboard.component';
import { DownloadFileComponent } from '../../download-file/download-file.component';
import { SearchBoxComponent } from '../../search-box/search-box.component';
import { CodeViewerComponent } from './code-viewer.component';

describe('Code Viewer Component', () => {
  const createComponent = createComponentFactory({
    component: CodeViewerComponent,
    declarations: [
      MockComponent(SearchBoxComponent),
      MockComponent(DownloadFileComponent),
      MockComponent(CopyToClipboardComponent)
    ],
    imports: [FormattingModule],
    shallow: true
  });
  const code = `{\n "key": "value" \n }`;
  const downloadFileName = 'code.json';

  test('should render everything correctly', () => {
    const spectator = createComponent({
      props: {
        code: ''
      }
    });
    expect(spectator.query('.code-viewer')).not.toExist();

    // Set code
    spectator.setInput({
      code: code
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

    // Highlight text
    spectator.setInput({
      highlightText: 'key'
    });

    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(1);
    expect(spectator.queryAll('.code-line.line-highlight').length).toBe(1);

    // Download
    spectator.setInput({
      downloadFileName: downloadFileName
    });

    expect(spectator.query(DownloadFileComponent)).toExist();
    expect(spectator.query(DownloadFileComponent)?.metadata?.fileName).toBe(downloadFileName);

    // Copy to clipboard
    spectator.setInput({
      enableCopy: true
    });

    expect(spectator.query(CopyToClipboardComponent)).toExist();

    // Search
    spectator.triggerEventHandler(SearchBoxComponent, 'valueChange', 'e');
    expect(spectator.queryAll('mark').length).toBe(2);
  });
});
