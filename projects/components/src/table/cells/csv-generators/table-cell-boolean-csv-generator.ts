import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { Injectable } from '@angular/core';
import { isUndefined } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class TableCellBooleanCsvGenerator implements TableCellCsvGeneratorBase<boolean> {
  public readonly type = 'CSV_GENERATOR';
  public readonly cellType: string = 'boolean';

  public generateSafeCsv(cellData?: boolean): string | undefined {
    return isUndefined(cellData) ? undefined : String(cellData);
  }
}
