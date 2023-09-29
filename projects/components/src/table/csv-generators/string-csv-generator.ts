import { CellCsvGenerator } from './cell-csv-generator';

export class StringCsvGenerator extends CellCsvGenerator {
  protected readonly type: string = 'string';
  public createCsv(cellData: string): string {
    return cellData;
  }
}
