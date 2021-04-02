import { StatefulTableRow, TableRowState } from '../../table-api';
import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Checkbox
})
export class TableCellStateParserCheckbox extends TableCellParserBase<TableRowState, TableRowState, undefined> {
  public parseValue(_: TableRowState, rowData: StatefulTableRow): TableRowState {
    return rowData.$$state;
  }

  public parseFilterValue(): undefined {
    return;
  }
}
