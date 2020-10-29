import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Icon
})
export class TableCellIconParser extends TableCellParserBase<CellData, IconData, string> {
  public parseValue(cellData: CellData): IconData {
    switch (typeof cellData) {
      case 'string':
        return {
          icon: cellData
        };
      default:
        return cellData;
    }
  }

  public parseFilterValue(cellData: CellData): string {
    return this.parseValue(cellData).icon;
  }
}

type CellData = string | IconData;
export interface IconData {
  icon: string;
  color?: string;
}
