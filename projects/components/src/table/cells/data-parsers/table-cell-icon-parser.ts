import { IconSize } from '../../../icon/icon-size';
import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Icon
})
export class TableCellIconParser extends TableCellParserBase<CellData, Value, FilterValue> {
  public parseValue(cellData: CellData): Value {
    switch (typeof cellData) {
      case 'string':
        return {
          icon: cellData,
          filterValue: cellData
        };
      default:
        return cellData;
    }
  }

  public parseFilterValue(cellData: CellData): FilterValue {
    return this.parseValue(cellData)?.filterValue;
  }
}

type CellData = string | IconData | undefined;
type Value = IconData | undefined;
type FilterValue = string | boolean | undefined;

export interface IconData {
  icon: string;
  color?: string;
  size?: IconSize;
  filterValue?: FilterValue;
}
