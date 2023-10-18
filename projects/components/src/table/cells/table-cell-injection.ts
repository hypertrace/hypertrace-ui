import { InjectionToken, Injector } from '@angular/core';
import { TableColumnConfig, TableRow } from '../table-api';
import { TableCellParserBase } from './table-cell-parser-base';

export const TABLE_COLUMN_CONFIG: InjectionToken<TableColumnConfig> = new InjectionToken('TABLE_COLUMN_CONFIG');
export const TABLE_COLUMN_INDEX: InjectionToken<TableColumnConfig> = new InjectionToken('TABLE_COLUMN_INDEX');
export const TABLE_DATA_PARSER: InjectionToken<TableCellParserBase<unknown, unknown, unknown>> = new InjectionToken(
  'TABLE_DATA_PARSER'
);
export const TABLE_CELL_DATA: InjectionToken<unknown> = new InjectionToken('TABLE_CELL_DATA');
export const TABLE_ROW_DATA: InjectionToken<unknown> = new InjectionToken('TABLE_ROW_DATA');

export const createTableCellInjector = (
  columnConfig: TableColumnConfig,
  index: number,
  parser: TableCellParserBase<unknown, unknown, unknown>,
  cellData: unknown,
  row: TableRow,
  injector: Injector
): Injector =>
  Injector.create({
    providers: [
      {
        provide: TABLE_COLUMN_CONFIG,
        useValue: columnConfig
      },
      {
        provide: TABLE_COLUMN_INDEX,
        useValue: index
      },
      {
        provide: TABLE_DATA_PARSER,
        useValue: parser
      },
      {
        provide: TABLE_CELL_DATA,
        useValue: cellData
      },
      {
        provide: TABLE_ROW_DATA,
        useValue: row
      }
    ],
    parent: injector
  });
