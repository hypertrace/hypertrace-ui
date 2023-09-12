import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { GlobalCsvDownloadService } from './global-csv-download.service';
import { of } from 'rxjs';
import { FileDownloadService, TableColumnConfig } from '@hypertrace/components';

describe('Global Csv Download Service', () => {
  const mockColumnConfigs: TableColumnConfig[] = [
    {
      id: 'test_1',
      title: 'Test_1',
      display: 'Test 1'
    },
    {
      id: 'test_2',
      title: 'Test_2',
      display: 'Test 2'
    }
  ];

  const mockModel = {
    getData: jest.fn(() =>
      of({
        data: [],
        totalCount: 0
      })
    )
  };

  const serviceFactory = createServiceFactory({
    service: GlobalCsvDownloadService,
    providers: [
      mockProvider(FileDownloadService, {
        downloadAsCsv: jest.fn().mockReturnValue(of(undefined))
      })
    ]
  });

  test('Register, get, check, delete and clean data source should work as expected', () => {
    const spectator = serviceFactory();
    spectator.service.registerDataSource('test', {
      columns: mockColumnConfigs,
      data: of(mockModel)
    });
    expect(spectator.service.getRegisteredDataSource('test')?.columns).toEqual(mockColumnConfigs);

    expect(spectator.service.hasRegisteredDataSource('test')).toBe(true);

    spectator.service.deleteRegisteredDataSource('test');
    expect(spectator.service.hasRegisteredDataSource('test')).toBe(false);

    spectator.service.registerDataSource('test', {
      columns: mockColumnConfigs,
      data: of(mockModel)
    });
    spectator.service.clearAllDataSource();
    expect(spectator.service.hasRegisteredDataSource('test')).toBe(false);
  });

  test('Download csv should work as expected', () => {
    const spectator = serviceFactory();
    spectator.service.downloadCsv();
    expect(spectator.inject(FileDownloadService).downloadAsCsv).not.toBeCalled();
    spectator.service.downloadCsv({ dataSource: of([]), fileName: 'traces.csv' });
    expect(spectator.inject(FileDownloadService).downloadAsCsv).toBeCalled();
  });
});
