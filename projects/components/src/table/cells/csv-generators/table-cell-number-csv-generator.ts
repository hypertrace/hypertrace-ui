import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';
import { Injectable } from '@angular/core';
import { isUndefined } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class TableCellNumberCsvGenerator implements TableCellCsvGeneratorBase<number> {
  public readonly type = 'CSV_GENERATOR';
  public readonly cellType: string = CoreTableCellRendererType.Number;
  public generateSafeCsv(cellData?: number): string | undefined {
    return isUndefined(cellData) ? undefined : cellData.toString();
  }
}
