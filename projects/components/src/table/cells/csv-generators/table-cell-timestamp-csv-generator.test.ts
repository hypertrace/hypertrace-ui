import { createServiceFactory } from '@ngneat/spectator/jest';
import { TableCellTimestampCsvGenerator } from './table-cell-timestamp-csv-generator';
import { DateFormatMode, DisplayDatePipe } from '@hypertrace/common';

describe('TableCellTimestampCsvGenerator', () => {
  const createService = createServiceFactory({
    service: TableCellTimestampCsvGenerator,
  });

  test('should return data as expected', () => {
    const displayDatePipe = new DisplayDatePipe();
    const spectator = createService();
    expect(spectator.service.generateSafeCsv(undefined)).toEqual('-');
    expect(spectator.service.generateSafeCsv(null)).toEqual('-');

    expect(spectator.service.generateSafeCsv(new Date('2021-05-25T15:53:27.376Z'))).toEqual(
      displayDatePipe.transform(new Date('2021-05-25T15:53:27.376Z'), { mode: DateFormatMode.DateAndTimeWithSeconds }),
    );
    expect(spectator.service.generateSafeCsv(1697654315)).toEqual(
      displayDatePipe.transform(1697654315, { mode: DateFormatMode.DateAndTimeWithSeconds }),
    );
  });
});
