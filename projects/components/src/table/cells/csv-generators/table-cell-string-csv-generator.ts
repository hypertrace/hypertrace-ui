import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { Injectable } from '@angular/core';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';

@Injectable({ providedIn: 'root' })
export class TableCellStringCsvGenerator implements TableCellCsvGeneratorBase<string> {
  public readonly type = 'CSV_GENERATOR';
  public cellType: string = CoreTableCellRendererType.Text;

  public generateSafeCsv(cellData?: string): string | undefined {
    return cellData ?? undefined;
  }
}
