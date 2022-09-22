import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { DownloadFileMetadata } from './download-file-metadata';
import { DownloadFileComponent } from './download-file.component';
import { FileDownloadEventType, FileDownloadService } from './service/file-download.service';

describe('Download File Component', () => {
  const createComponent = createComponentFactory({
    component: DownloadFileComponent,
    declarations: [MockComponent(ButtonComponent), MockComponent(IconComponent)],
    shallow: true
  });

  const metadata: DownloadFileMetadata = {
    dataSource: of(''),
    fileName: 'download.txt'
  };

  test('should have loading icon, when data is loading', () => {
    const spectator = createComponent({
      props: {
        metadata: metadata
      },
      providers: [
        mockProvider(FileDownloadService, {
          downloadAsText: jest.fn(),
          fileDownloadEvent$: of(FileDownloadEventType.Progress)
        })
      ]
    });

    expect(spectator.query(ButtonComponent)).not.toExist();
    expect(spectator.query(IconComponent)).toExist();
  });

  test('should download file', () => {
    const spectator = createComponent({
      props: {
        metadata: metadata
      },
      providers: [
        mockProvider(FileDownloadService, {
          downloadAsText: jest.fn(),
          fileDownloadEvent$: of(undefined)
        })
      ]
    });
    spectator.click('.download-file');
    expect(spectator.inject(FileDownloadService).downloadAsText).toHaveBeenCalledWith(metadata);
  });
});
