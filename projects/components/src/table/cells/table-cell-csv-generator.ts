import { Dictionary } from '@hypertrace/common';
import { InjectionToken } from '@angular/core';

export const TABLE_CELL_CSV_GENERATORS = new InjectionToken<TableCellCsvGenerator<unknown>[][]>(
  'TABLE_CELL_CSV_GENERATORS'
);

export interface TableCellCsvGenerator<TCellData, TRowData = unknown> {
  readonly cellType: string;

  generateSafeCsv(cellData?: TCellData | null, rowData?: TRowData | null): string | Dictionary<string> | undefined;
}
