import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Observable, of, throwError } from 'rxjs';
import { switchMapTo } from 'rxjs/operators';
import { NotificationService } from '../../notification/notification.service';
import { FileDownloadEventType, FileDownloadService } from './file-download.service';

describe('File Download Service', () => {
  const mockElement = document.createElement('a');

  Object.defineProperty(document, 'createElement', { value: jest.fn().mockReturnValue(mockElement) });
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn().mockReturnValue('') });

  const createService = createServiceFactory({
    service: FileDownloadService,
    providers: [
      mockProvider(NotificationService, {
        withNotification: () => (x: Observable<unknown>) => x
      })
    ]
  });

  test('should download as text correctly', () => {
    const spectator = createService();
    const data$ = of('test');

    // With correct data
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.downloadAsText({ dataSource: data$, fileName: 'download.text' })).toBe(
        '(x|)',
        {
          x: { type: FileDownloadEventType.Success }
        }
      );
    });

    // With error
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        spectator.service.downloadAsText({
          dataSource: data$.pipe(switchMapTo(throwError(''))),
          fileName: 'download.text'
        })
      ).toBe('(x|)', {
        x: { type: FileDownloadEventType.Failure, error: 'File upload failed due to unknown error' }
      });
    });
  });

  test('should download as csv correctly', () => {
    const spectator = createService();
    const csvData$ = of([{ name: 'traceable', headCount: 123 }]);

    // With correct data
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.downloadAsCsv({ dataSource: csvData$, fileName: 'download.csv' })).toBe(
        '(x|)',
        {
          x: { type: FileDownloadEventType.Success }
        }
      );
    });
  });

  test('should download blob correctly', () => {
    const spectator = createService();
    const pngData$ = of(new Blob());

    // With correct data
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.downloadBlob({ dataSource: pngData$, fileName: 'download-file.png' })).toBe(
        '(x|)',
        {
          x: { type: FileDownloadEventType.Success }
        }
      );
    });
  });
});
