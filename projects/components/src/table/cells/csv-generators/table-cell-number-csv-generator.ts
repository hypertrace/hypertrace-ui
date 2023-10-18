import { TableCellCsvGenerator } from '../table-cell-csv-generator';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';
import { Injectable } from '@angular/core';
import { isNil } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class TableCellNumberCsvGenerator implements TableCellCsvGenerator<number> {
  public readonly cellType: string = CoreTableCellRendererType.Number;
  public generateSafeCsv(cellData?: number): string | undefined {
    return isNil(cellData) ? undefined : cellData.toString();
  }
}
