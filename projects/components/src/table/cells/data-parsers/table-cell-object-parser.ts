import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.Object
})
export class TableCellObjectParser extends TableCellParserBase<ObjectCellData, ObjectCellData, string | undefined> {
  public parseValue(cellData: ObjectCellData): ObjectCellData {
    return cellData;
  }

  public parseFilterValue(cellData: ObjectCellData): string | undefined {
    return this.parseValue(cellData).filterValue;
  }
}

// Since object is very generic, using an explicit key fr default filter value
interface ObjectCellData extends Object {
  filterValue?: string;
}


