import { IconSize } from '../../../icon/icon-size';
import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Icon
})
export class TableCellIconParser extends TableCellParserBase<CellData, Value, FilterValue> {
  public parseValue(cellData: CellData): IconData | undefined {
    switch (typeof cellData) {
      case 'string':
        return {
          icon: cellData
        };
      default:
        return cellData;
    }
  }

  public parseFilterValue(cellData: CellData): string | undefined {
    return this.parseValue(cellData)?.icon;
  }
}

type CellData = string | IconData | undefined;
type Value = IconData | undefined;
type FilterValue = string | undefined;

export interface IconData {
  icon: string;
  color?: string;
  size?: IconSize;
}
