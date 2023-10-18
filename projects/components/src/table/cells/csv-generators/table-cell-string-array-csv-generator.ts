import { TableCellCsvGenerator } from '../table-cell-csv-generator';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';
import { Injectable } from '@angular/core';
import { isNil } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class TableCellStringArrayCsvGenerator implements TableCellCsvGenerator<string[]> {
  public readonly cellType: string = CoreTableCellRendererType.StringArray;

  public generateSafeCsv(cellData?: string[]): string | undefined {
    return isNil(cellData) ? undefined : cellData.join(', ');
  }
}
