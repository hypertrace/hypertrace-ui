import { TableCellCsvGenerator } from '../table-cell-csv-generator-lookup.service';
import { TableCellCsvGeneratorBase } from '../table-cell-csv-generator-base';
import { CoreTableCellCsvGeneratorType } from '../types/core-table-cell-csv-generator-type';

@TableCellCsvGenerator({
  type: CoreTableCellCsvGeneratorType.StringArray
})
export class TableCellStringArrayCsvGenerator extends TableCellCsvGeneratorBase<string[]> {
  protected generateCsv(cellData: string[]): string {
    return cellData.join(', ');
  }
}
