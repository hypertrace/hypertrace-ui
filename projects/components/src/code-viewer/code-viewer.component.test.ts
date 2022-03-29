import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { DownloadFileMetadata } from '../download-file/download-file-metadata';
import { DownloadFileComponent } from '../download-file/download-file.component';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { CodeViewerComponent } from './code-viewer.component';

describe('Code Viewer Component', () => {
  const createComponent = createComponentFactory({
    component: CodeViewerComponent,
    declarations: [MockComponent(SearchBoxComponent), MockComponent(DownloadFileComponent)],
    shallow: true
  });
  const code: string[] = ['{', `  "key": "value"`, '}'];
  const downloadMetadata: DownloadFileMetadata = {
    dataSource: of(''),
    fileName: 'code.json'
  };

  test('should render everything correctly', () => {
    const spectator = createComponent({
      props: {
        code: [],
        titleText: 'New code viewer'
      }
    });
    expect(spectator.query('.code-viewer')).toExist();
    expect(spectator.query(SearchBoxComponent)).toExist();
    expect(spectator.query(DownloadFileComponent)).not.toExist();
    expect(spectator.query('.code-viewer')).toExist();
    expect(spectator.query('.title')).toHaveText('New code viewer');
    expect(spectator.queryAll('.line-number').length).toBe(0);
    expect(spectator.queryAll('.code-line').length).toBe(0);

    // Set code
    spectator.setInput({
      code: code,
      highlightText: 'key',
      downloadCodeMetadata: downloadMetadata
    });

    expect(spectator.query(DownloadFileComponent)?.metadata).toMatchObject(downloadMetadata);
    expect(spectator.queryAll('.line-number').length).toBe(3);
    expect(spectator.queryAll('.line-number.highlight').length).toBe(1);
    expect(spectator.queryAll('.code-line').length).toBe(3);
    expect(spectator.queryAll('.code-line.highlight').length).toBe(1);

    // Search
    spectator.triggerEventHandler(SearchBoxComponent, 'valueChange', 'e');
    expect(spectator.queryAll('.searched').length).toBe(2);
  });
});
