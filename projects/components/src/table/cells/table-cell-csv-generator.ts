import { Dictionary } from '@hypertrace/common';
import { InjectionToken } from '@angular/core';
import { TableRow } from '../table-api';

export const TABLE_CELL_CSV_GENERATORS = new InjectionToken<TableCellCsvGenerator<unknown>[][]>(
  'TABLE_CELL_CSV_GENERATORS'
);

export interface TableCellCsvGenerator<TCellData, TRowData = TableRow> {
  readonly cellType: string;

  generateSafeCsv(
    cellData: TCellData | null | undefined,
    rowData?: TRowData | null
  ): string | Dictionary<string> | undefined;
}
