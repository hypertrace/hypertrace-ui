import { TableCellCsvGenerator } from '../table-cell-csv-generator';
import { Injectable } from '@angular/core';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';

@Injectable({ providedIn: 'root' })
export class TableCellStringCsvGenerator implements TableCellCsvGenerator<string> {
  public cellType: string = CoreTableCellRendererType.Text;

  public generateSafeCsv(cellData: string | null | undefined): string | undefined {
    return cellData ?? undefined;
  }
}
