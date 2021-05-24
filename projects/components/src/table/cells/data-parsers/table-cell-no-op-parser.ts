import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.NoOp
})
export class TableCellNoOpParser<T = unknown> extends TableCellParserBase<T, T, string | undefined> {
  public parseValue(cellData: T): T {
    return cellData;
  }

  public parseFilterValue(cellData: T | { filterValue?: string }): string | undefined {
    // tslint:disable-next-line:strict-type-predicates
    if (typeof cellData === 'object' && cellData !== null && 'filterValue' in cellData) {
      return cellData.filterValue;
    }

    return String(cellData);
  }
}
