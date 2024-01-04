import { Injector } from '@angular/core';
import { TableRow } from '../table-api';
import { CoreTableCellParserType } from './types/core-table-cell-parser-type';

export abstract class TableCellParserBase<TCellData, TValue, TFilterValue> {
  public static readonly type: CoreTableCellParserType;

  public constructor(protected readonly rootInjector: Injector) {}

  public abstract parseValue(cellData: TCellData, rowData: TableRow): TValue;
  public abstract parseFilterValue(cellData: TCellData): TFilterValue;

  public parseUnits(_cellData: TCellData, _rowData: TableRow): string {
    return '';
  }

  public parseTooltip(cellData: TCellData, rowData: TableRow): string {
    return `${String(this.parseValue(cellData, rowData))} ${this.parseUnits(cellData, rowData)}`.trim();
  }
}
