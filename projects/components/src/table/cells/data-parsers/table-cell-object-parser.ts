import { Dictionary } from '@hypertrace/common';
import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Object
})
export class TableCellObjectParser extends TableCellParserBase<unknown, unknown, string | undefined> {
  public parseValue(cellData: unknown): unknown {
    return cellData;
  }

  public parseFilterValue(cellData: unknown): string | undefined {
    if (typeof cellData === 'object' && cellData !== null && 'filterValue' in cellData) {
      return (cellData as Dictionary<unknown>).filterValue as string;
    }

    return String(cellData);
  }
}
