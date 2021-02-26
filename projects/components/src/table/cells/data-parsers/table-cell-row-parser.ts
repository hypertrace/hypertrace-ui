import { TableRow } from '../../table-api';
import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Row
})
export class TableCellRowParser extends TableCellParserBase<unknown, TableRow, unknown> {
  public parseValue(_: unknown, rowData: TableRow): TableRow {
    return rowData;
  }

  public parseFilterValue(cellData: unknown): unknown {
    return cellData;
  }

  public parseTooltip(cellData: unknown, rowData: TableRow): string {
    return `${String(cellData)} ${this.parseUnits(cellData, rowData)}`.trim();
  }
}
