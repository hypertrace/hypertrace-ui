import { createServiceFactory } from '@ngneat/spectator/jest';
import { TableCellStringArrayCsvGenerator } from './table-cell-string-array-csv-generator';

describe('TableCellStringArrayCsvGenerator', () => {
  const createService = createServiceFactory({
    service: TableCellStringArrayCsvGenerator
  });

  test('should return data as expected', () => {
    const spectator = createService();
    expect(spectator.service.generateSafeCsv(undefined)).toBeUndefined();
    expect(spectator.service.generateSafeCsv(null)).toBeUndefined();

    expect(spectator.service.generateSafeCsv(['a'])).toEqual('a');
    expect(spectator.service.generateSafeCsv(['a', 'b'])).toEqual('a, b');
  });
});
