import { Renderer2 } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { DownloadFileMetadata } from './download-file-metadata';
import { DownloadFileComponent } from './download-file.component';
import { DownloadFileModule } from './download-file.module';

describe('Download File Component', () => {
  let spectator: Spectator<DownloadFileComponent>;
  const mockElement = document.createElement('a');
  const createElementSpy = jest.fn().mockReturnValue(mockElement);

  const createHost = createHostFactory({
    component: DownloadFileComponent,
    imports: [DownloadFileModule, RouterTestingModule],
    declarations: [MockComponent(ButtonComponent), MockComponent(IconComponent)],
    providers: [
      mockProvider(Document, {
        createElement: createElementSpy
      }),
      mockProvider(Renderer2, {
        setAttribute: jest.fn()
      })
    ],
    shallow: true
  });

  const metadata: DownloadFileMetadata = {
    dataSource: of(''),
    fileName: 'download.txt'
  };

  test('should have only download button, when data is not loading', () => {
    spectator = createHost(`<ht-download-file [metadata]="metadata"></ht-download-file>`, {
      hostProps: {
        metadata: metadata
      }
    });

    expect(spectator.query(ButtonComponent)).toExist();
  });

  test('should download file', fakeAsync(() => {
    spectator = createHost(`<ht-download-file [metadata]="metadata"></ht-download-file>`, {
      hostProps: {
        metadata: metadata
      }
    });

    spyOn(spectator.component, 'triggerDownload');

    expect(spectator.component.dataLoading).toBe(false);
    const element = spectator.query('.download-file');
    expect(element).toExist();

    spectator.click(element!);
    spectator.tick();

    expect(spectator.component.triggerDownload).toHaveBeenCalledTimes(1);
  }));
});
