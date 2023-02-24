import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Boolean
})
export class TableCellBooleanParser extends TableCellParserBase<boolean, boolean, boolean> {
  public parseValue(cellData: boolean): boolean {
    return cellData;
  }

  public parseFilterValue(cellData: boolean): boolean {
    return this.parseValue(cellData);
  }
}
