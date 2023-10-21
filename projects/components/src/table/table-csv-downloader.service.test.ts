import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { FileDownloadService, NotificationService, TableCsvDownloaderService, TableRow } from '@hypertrace/components';
import { EMPTY, of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { TableColumnConfigExtended } from './table.service';
import { Dictionary } from '@hypertrace/common';

describe('TableCsvDownloaderService', () => {
  const createService = createServiceFactory({
    service: TableCsvDownloaderService,
    providers: [
      mockProvider(FileDownloadService, {
        downloadAsCsv: jest.fn().mockReturnValue(EMPTY)
      }),
      mockProvider(NotificationService, {
        createInfoToast: jest.fn()
      })
    ]
  });

  test('execute download should behave as expected for no data', fakeAsync(() => {
    const spectator = createService();
    spectator.service.executeDownload(of({ rows: [], columnConfigs: [] }), 'table-id.csv');

    tick();
    expect(spectator.inject(NotificationService).createInfoToast).toHaveBeenCalledWith('No data to download');
    expect(spectator.inject(FileDownloadService).downloadAsCsv).not.toHaveBeenCalled();
  }));

  test('execute download should behave as expected when data is present', fakeAsync(() => {
    const spectator = createService();
    spectator.service.executeDownload(
      of({
        rows: [{ key1: 'value1' }] as TableRow[],
        columnConfigs: [
          {
            id: 'key1',
            name: 'key1',
            csvGenerator: { generateSafeCsv: (cellData: Dictionary<string>, _row): Dictionary<string> => cellData }
          }
        ] as TableColumnConfigExtended[]
      }),
      'table-id.csv'
    );
    tick();

    expect(spectator.inject(FileDownloadService).downloadAsCsv).toHaveBeenCalled();
  }));
});
