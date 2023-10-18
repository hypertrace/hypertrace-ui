import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';
import { Injectable } from '@angular/core';
import { isUndefined } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class TableCellStringArrayCsvGenerator implements TableCellCsvGeneratorBase<string[]> {
  public readonly type = 'CSV_GENERATOR';
  public readonly cellType: string = CoreTableCellRendererType.StringArray;

  public generateSafeCsv(cellData?: string[]): string | undefined {
    return isUndefined(cellData) ? undefined : cellData.join(', ');
  }
}
