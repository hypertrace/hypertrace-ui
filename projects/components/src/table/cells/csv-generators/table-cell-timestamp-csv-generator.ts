import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { DateFormatMode, DisplayDatePipe } from '@hypertrace/common';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableCellTimestampCsvGenerator implements TableCellCsvGeneratorBase<Date | number | string> {
  public readonly type = 'CSV_GENERATOR';
  public cellType: string = CoreTableCellRendererType.Timestamp;
  private readonly displayDate: DisplayDatePipe = new DisplayDatePipe();

  public generateSafeCsv(cellData?: Date | number | string): string {
    return this.displayDate.transform(cellData, { mode: DateFormatMode.TimeWithSeconds });
  }
}
