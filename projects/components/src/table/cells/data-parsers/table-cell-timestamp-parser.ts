import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Timestamp
})
export class TableCellTimestampParser extends TableCellParserBase<CellData, CellData, CellData> {
  public parseValue(cellData: CellData): CellData {
    return cellData;
  }

  public parseFilterValue(cellData: CellData): CellData {
    return this.parseValue(cellData);
  }
}

type CellData = Date | number;
