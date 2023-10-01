import { CellCsvGenerator } from './cell-csv-generator';

export class NumberCsvGenerator extends CellCsvGenerator {
  public createCsv(cellData: number): string {
    return cellData.toString();
  }
}
