import { Injector } from '@angular/core';
import { CoreTableCellCsvGeneratorType } from './types/core-table-cell-csv-generator-type';

export abstract class TableCellCsvGeneratorBase<TCellData, TRowData = unknown> {
  public static readonly type: CoreTableCellCsvGeneratorType | string;

  public constructor(protected readonly rootInjector: Injector) {}

  public abstract generateCsv(cellData: TCellData, rowData: TRowData): string | undefined;
}
