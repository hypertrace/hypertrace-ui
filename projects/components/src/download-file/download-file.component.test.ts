import { fakeAsync, flush } from '@angular/core/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of, timer } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { DownloadFileMetadata } from './download-file-metadata';
import { DownloadFileComponent } from './download-file.component';
import { FileDownloadService } from './service/file-download.service';

describe('Download File Component', () => {
  const createComponent = createComponentFactory({
    component: DownloadFileComponent,
    declarations: [MockComponent(ButtonComponent), MockComponent(IconComponent)],
    providers: [mockProvider(FileDownloadService)],
    shallow: true
  });

  const metadata: DownloadFileMetadata = {
    dataSource: of(''),
    fileName: 'download.txt'
  };

  test('should download file', fakeAsync(() => {
    const spectator = createComponent({
      props: {
        metadata: metadata
      },
      providers: [
        mockProvider(FileDownloadService, {
          downloadAsText: jest.fn().mockReturnValue(timer(2000))
        })
      ]
    });

    // Before data loading
    expect(spectator.query(ButtonComponent)).toExist();
    expect(spectator.query(IconComponent)).not.toExist();

    // While data loading
    spectator.click('.download-file');
    expect(spectator.query(ButtonComponent)).not.toExist();
    expect(spectator.query(IconComponent)).toExist();
    spectator.tick(2500);

    // After Data loading
    expect(spectator.query(ButtonComponent)).toExist();
    expect(spectator.query(IconComponent)).not.toExist();
    expect(spectator.inject(FileDownloadService).downloadAsText).toHaveBeenCalledWith(metadata);
    flush();
  }));
});
