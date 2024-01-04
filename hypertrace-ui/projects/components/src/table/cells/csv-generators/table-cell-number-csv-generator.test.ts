import { createServiceFactory } from '@ngneat/spectator/jest';
import { TableCellNumberCsvGenerator } from './table-cell-number-csv-generator';

describe('TableCellNumberCsvGenerator', () => {
  const createService = createServiceFactory({
    service: TableCellNumberCsvGenerator,
  });

  test('should return data as expected', () => {
    const spectator = createService();
    expect(spectator.service.generateSafeCsv(undefined)).toBeUndefined();
    expect(spectator.service.generateSafeCsv(null)).toBeUndefined();

    expect(spectator.service.generateSafeCsv(1)).toEqual('1');
  });
});
