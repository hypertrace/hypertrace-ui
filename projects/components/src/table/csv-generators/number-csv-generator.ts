import { CellCsvGenerator } from './cell-csv-generator';

export class NumberCsvGenerator implements CellCsvGenerator {
  protected readonly type: string = 'number';

  public createCsv(cellData: number): string {
    return cellData.toString();
  }
}
