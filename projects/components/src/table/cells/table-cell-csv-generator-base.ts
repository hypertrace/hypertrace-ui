import { Dictionary } from '@hypertrace/common';
import { CoreTableCellRendererType } from './types/core-table-cell-renderer-type';
import { InjectionToken } from '@angular/core';

export const TABLE_CELL_CSV_GENERATORS = new InjectionToken<unknown[][]>('TABLE_CELL_CSV_GENERATORS');

export interface TableCellCsvGeneratorBase<TCellData, TRowData = unknown> {
  readonly type: CSV_GENERATOR_TYPE;
  readonly cellType: CoreTableCellRendererType | string;

  generateSafeCsv(cellData?: TCellData, rowData?: TRowData): string | Dictionary<string> | undefined;
}

type CSV_GENERATOR_TYPE = 'CSV_GENERATOR';
