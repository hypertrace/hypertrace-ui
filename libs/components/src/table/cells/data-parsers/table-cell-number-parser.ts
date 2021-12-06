import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Number
})
export class TableCellNumberParser extends TableCellParserBase<CellData, Value, Value> {
  public parseValue(cellData: CellData): Value {
    switch (typeof cellData) {
      case 'number':
        return cellData;
      case 'object':
        return cellData.value;
      default:
        return undefined;
    }
  }

  public parseFilterValue(cellData: CellData): Value {
    return this.parseValue(cellData);
  }
}

type CellData = number | { value: number };
type Value = number | undefined;
