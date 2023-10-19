import { TableCellCsvGenerator } from '../table-cell-csv-generator';
import { DateFormatMode, DisplayDatePipe } from '@hypertrace/common';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableCellTimestampCsvGenerator implements TableCellCsvGenerator<Date | number | string> {
  public cellType: string = CoreTableCellRendererType.Timestamp;
  private readonly displayDate: DisplayDatePipe = new DisplayDatePipe();

  public generateSafeCsv(cellData: Date | number | string | null | undefined): string {
    return this.displayDate.transform(cellData, { mode: DateFormatMode.TimeWithSeconds });
  }
}
