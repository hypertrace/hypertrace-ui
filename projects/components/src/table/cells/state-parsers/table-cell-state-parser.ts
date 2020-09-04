import { TableRowState } from '../../table-api';
import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.State
})
export class TableCellStateParser extends TableCellParserBase<TableRowState, TableRowState, undefined> {
  public parseValue(cellData: TableRowState): TableRowState {
    return cellData;
  }

  public parseFilterValue(): undefined {
    return;
  }
}
