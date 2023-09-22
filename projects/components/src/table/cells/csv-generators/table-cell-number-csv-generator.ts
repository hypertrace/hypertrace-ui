import { TableCellCsvGenerator } from '../table-cell-csv-generator-lookup.service';
import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { CoreTableCellCsvGeneratorType } from '../types/core-table-cell-csv-generator-type';

@TableCellCsvGenerator({
  type: CoreTableCellCsvGeneratorType.Number
})
export class TableCellNumberCsvGenerator extends TableCellCsvGeneratorBase<number> {
  public generateCsv(cellData: number): string {
    return cellData.toString();
  }
}
