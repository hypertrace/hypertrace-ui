import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of, throwError } from 'rxjs';
import { switchMapTo, take } from 'rxjs/operators';
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
        createFailureToast: jest.fn(),
        createSuccessToast: jest.fn()
      })
    ]
  });

  test('should download as text correctly', () => {
    const spectator = createService();
    const data$ = of('test');

    // With correct data
    spectator.service.downloadAsText({ dataSource: data$, fileName: 'download.text' });
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.fileDownloadEvent$.pipe(take(1))).toBe('(x|)', {
        x: FileDownloadEventType.Success
      });
    });
    expect(spectator.inject(NotificationService).createSuccessToast).toHaveBeenLastCalledWith(
      'File download successful'
    );

    // With error
    spectator.service.downloadAsCsv({
      dataSource: data$.pipe(switchMapTo(throwError(''))),
      fileName: 'download.text'
    });
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.fileDownloadEvent$.pipe(take(1))).toBe('(x|)', {
        x: FileDownloadEventType.Failure
      });
    });
    expect(spectator.inject(NotificationService).createFailureToast).toHaveBeenLastCalledWith('File download failed');
  });

  test('should download as csv correctly', () => {
    const spectator = createService();
    const csvData$ = of([{ name: 'traceable', headCount: 123 }]);

    // With correct data
    spectator.service.downloadAsCsv({ dataSource: csvData$, fileName: 'download.csv' });
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.fileDownloadEvent$.pipe(take(1))).toBe('(x|)', {
        x: FileDownloadEventType.Success
      });
    });
    expect(spectator.inject(NotificationService).createSuccessToast).toHaveBeenLastCalledWith(
      'File download successful'
    );
  });
});
