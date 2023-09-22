import { TableCellCsvGenerator } from '../table-cell-csv-generator-lookup.service';
import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { CoreTableCellCsvGeneratorType } from '../types/core-table-cell-csv-generator-type';
import { DateFormatMode, DisplayDatePipe } from '@hypertrace/common';

@TableCellCsvGenerator({
  type: CoreTableCellCsvGeneratorType.Timestamp
})
export class TableCellTimestampCsvGenerator extends TableCellCsvGeneratorBase<Date | number | string> {
  private readonly displayDate: DisplayDatePipe = new DisplayDatePipe();
  public generateCsv(cellData: Date | number | string): string {
    return this.displayDate.transform(cellData, { mode: DateFormatMode.TimeWithSeconds });
  }
}
