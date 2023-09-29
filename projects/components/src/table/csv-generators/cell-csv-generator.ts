import { isNil } from 'lodash-es';

export abstract class CellCsvGenerator {
  protected abstract readonly type: string;

  public generate(cellData?: unknown, rowData?: unknown): string {
    if (isNil(cellData)) {
      return '-';
    }

    return this.createCsv(cellData, rowData);
  }

  // Extended methods need to implement only this method
  // Sanity check of data and defaulting is done in generate method
  protected abstract createCsv(cellData: unknown, rowData?: unknown): string;
}
//
// export interface CellCsvGeneratorConfig {
//   createCsv: (cellData: unknown, rowData?: unknown) => string;
// }
