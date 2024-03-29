import { TableCellCsvGenerator } from '../table-cell-csv-generator';
import { Injectable } from '@angular/core';
import { isNil } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class TableCellBooleanCsvGenerator implements TableCellCsvGenerator<boolean> {
  public readonly cellType: string = 'boolean';

  public generateSafeCsv(cellData: boolean | null | undefined): string | undefined {
    return isNil(cellData) ? undefined : String(cellData);
  }
}
