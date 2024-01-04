import { createServiceFactory } from '@ngneat/spectator/jest';
import { TableCellStringCsvGenerator } from './table-cell-string-csv-generator';

describe('TableCellStringCsvGenerator', () => {
  const createService = createServiceFactory({
    service: TableCellStringCsvGenerator,
  });

  test('should return data as expected', () => {
    const spectator = createService();
    expect(spectator.service.generateSafeCsv(undefined)).toBeUndefined();
    expect(spectator.service.generateSafeCsv(null)).toBeUndefined();

    expect(spectator.service.generateSafeCsv('test')).toEqual('test');
  });
});
