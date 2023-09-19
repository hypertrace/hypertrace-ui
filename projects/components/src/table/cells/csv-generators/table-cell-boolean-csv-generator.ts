import { TableCellCsvGenerator } from '../table-cell-csv-generator-lookup.service';
import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { CoreTableCellCsvGeneratorType } from '../types/core-table-cell-csv-generator-type';

@TableCellCsvGenerator({
  type: CoreTableCellCsvGeneratorType.Boolean
})
export class TableCellBooleanCsvGenerator extends TableCellCsvGeneratorBase<boolean> {
  public generateCsv(cellData: boolean): string {
    return String(cellData);
  }
}
