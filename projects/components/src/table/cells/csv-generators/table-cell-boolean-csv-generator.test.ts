import { createServiceFactory } from '@ngneat/spectator/jest';
import { TableCellBooleanCsvGenerator } from './table-cell-boolean-csv-generator';

describe('TableCellBooleanCsvGenerator', () => {
  const createService = createServiceFactory({
    service: TableCellBooleanCsvGenerator
  });

  test('should return data as expected', () => {
    const spectator = createService();
    expect(spectator.service.generateSafeCsv(undefined)).toBeUndefined();
    expect(spectator.service.generateSafeCsv(null)).toBeUndefined();

    expect(spectator.service.generateSafeCsv(true)).toEqual('true');
    expect(spectator.service.generateSafeCsv(false)).toEqual('false');
  });
});
