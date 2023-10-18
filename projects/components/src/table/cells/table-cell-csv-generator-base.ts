import { Injector } from '@angular/core';
import { CoreTableCellCsvGeneratorType } from './types/core-table-cell-csv-generator-type';
import { isNil } from 'lodash-es';
import { Dictionary } from '@hypertrace/common';

export abstract class TableCellCsvGeneratorBase<TCellData, TRowData = unknown> {
  public static readonly type: CoreTableCellCsvGeneratorType | string;

  public constructor(protected readonly rootInjector: Injector) {}

  public generateSafeCsv(cellData?: TCellData, rowData?: TRowData): string | Dictionary<string> | undefined {
    if (isNil(cellData)) {
      return '';
    } else {
      const csvString = this.generateCsv(cellData, rowData);

      return isNil(csvString) ? '' : csvString;
    }
  }

  protected abstract generateCsv(cellData: TCellData, rowData?: TRowData): string | Dictionary<string> | undefined;
}
