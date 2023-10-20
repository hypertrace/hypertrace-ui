import { createServiceFactory } from '@ngneat/spectator/jest';
import { TableCellStringEnumCsvGenerator } from './table-cell-string-enum-csv-generator';
import { DisplayStringEnumPipe } from '@hypertrace/common';

describe('TableCellStringEnumCsvGenerator', () => {
  const createService = createServiceFactory({
    service: TableCellStringEnumCsvGenerator
  });

  const stringEnumPipe = new DisplayStringEnumPipe();

  test('should return data as expected', () => {
    const spectator = createService();
    expect(spectator.service.generateSafeCsv(undefined)).toBeUndefined();
    expect(spectator.service.generateSafeCsv(null)).toBeUndefined();

    expect(spectator.service.generateSafeCsv('TEST')).toEqual(stringEnumPipe.transform('TEST'));
  });
});
