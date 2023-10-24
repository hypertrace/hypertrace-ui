import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Observable, of, throwError } from 'rxjs';
import { switchMapTo } from 'rxjs/operators';
import { NotificationService } from '../../notification/notification.service';
import { FileDownloadEventType, FileDownloadService } from './file-download.service';

describe('File Download Service', () => {
  const mockElement = document.createElement('a');
  const mockBlobResponse = new Blob(['test'], { type: 'text/csv' });
  Object.defineProperty(document, 'createElement', { value: jest.fn().mockReturnValue(mockElement) });
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn().mockReturnValue('') });
  const blobConstructorSpy = jest.spyOn(window, 'Blob').mockReturnValue(mockBlobResponse);
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
    let csvData$ = of([
      { name: 'example', headCount: 123 },
      { name: 'hypertrace', headCount: 456, optionalValue: 1 }
    ]);
    // With correct data
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.downloadAsCsv({ dataSource: csvData$, fileName: 'download.csv' })).toBe(
        '(x|)',
        {
          x: { type: FileDownloadEventType.Success }
        }
      );
    });

    // CSV conversion should work as expected
    expect(blobConstructorSpy).toHaveBeenLastCalledWith(
      [`Name,Head Count,Optional Value\r\n"example",123,"-"\r\n"hypertrace",456,1`],
      { type: 'text/csv' }
    );

    //<------ Dataset-2 -  by passing headers explicitly ------>
    csvData$ = of([
      { name: 'example', headCount: 123, foo: 'bar' },
      { name: 'hypertrace', headCount: 456, optionalValue: 1, foo: undefined, bar: 'baz' }
    ]);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        spectator.service.downloadAsCsv({
          dataSource: csvData$,
          fileName: 'download.csv',
          header: ['name', 'foo', 'optionalValue']
        })
      ).toBe('(x|)', {
        x: { type: FileDownloadEventType.Success }
      });
    });
    // CSV conversion should work as expected
    expect(blobConstructorSpy).toHaveBeenLastCalledWith(
      [`Name,Foo,Optional Value\r\n"example","bar","-"\r\n"hypertrace","-",1`],
      { type: 'text/csv' }
    );
  });
});
