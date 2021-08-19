import { DateCoercer } from '@hypertrace/common';
import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Timestamp
})
export class TableCellTimestampParser extends TableCellParserBase<CellData, Value, Value> {
  private readonly dateCoercer: DateCoercer = new DateCoercer();
  public parseValue(cellData: CellData): Value {
    switch (typeof cellData) {
      case 'number':
        return cellData;
      case 'object':
        return cellData instanceof Date ? cellData : cellData.value;
      default:
        return this.dateCoercer.coerce(cellData);
    }
  }

  public parseFilterValue(cellData: CellData): Value {
    return this.parseValue(cellData);
  }
}

type CellData = Date | number | { value: Date | number };
type Value = Date | number | undefined;
