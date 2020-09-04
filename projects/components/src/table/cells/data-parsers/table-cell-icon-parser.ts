import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Icon
})
export class TableCellIconParser extends TableCellParserBase<string, string, string> {
  public parseValue(cellData: string): string {
    return cellData;
  }

  public parseFilterValue(cellData: string): string {
    return this.parseValue(cellData);
  }
}
