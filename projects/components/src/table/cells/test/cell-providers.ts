import { TableColumnConfig, TableRow } from '../../table-api';
import {
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_DATA_PARSER,
  TABLE_ROW_DATA
} from '../table-cell-injection';
import { TableCellParserBase } from '../table-cell-parser-base';

export const tableCellProviders = (
  columnConfig: TableColumnConfig,
  parser: TableCellParserBase<unknown, unknown, unknown>,
  index: number = 0,
  cellData: unknown = undefined,
  rowData: TableRow = {}
) => [
  tableCellColumnProvider(columnConfig),
  tableCellDataParserProvider(parser),
  tableCellIndexProvider(index),
  tableCellDataProvider(cellData),
  tableCellRowDataProvider(rowData)
];

export const tableCellColumnProvider = (columnConfig: TableColumnConfig) => ({
  provide: TABLE_COLUMN_CONFIG,
  useValue: columnConfig
});

export const tableCellIndexProvider = (index: number) => ({
  provide: TABLE_COLUMN_INDEX,
  useValue: index
});

export const tableCellDataParserProvider = (parser: TableCellParserBase<unknown, unknown, unknown>) => ({
  provide: TABLE_DATA_PARSER,
  useValue: parser
});

export const tableCellDataProvider = (cellData: unknown) => ({
  provide: TABLE_CELL_DATA,
  useValue: cellData
});

export const tableCellRowDataProvider = (rowData: TableRow) => ({
  provide: TABLE_ROW_DATA,
  useValue: rowData
});
