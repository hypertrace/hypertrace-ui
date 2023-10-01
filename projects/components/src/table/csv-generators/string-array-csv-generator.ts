import { CellCsvGenerator } from './cell-csv-generator';

export class StringArrayCsvGenerator extends CellCsvGenerator {
  protected createCsv(cellData: string[]): string {
    return cellData.join(', ');
  }
}
