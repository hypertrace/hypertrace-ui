import { isNil } from 'lodash-es';
import { Dictionary } from '@hypertrace/common';

export abstract class CellCsvGenerator {
  public generate(cellData?: unknown, rowData?: unknown): string | Dictionary<string> {
    if (isNil(cellData)) {
      return '-';
    }

    return this.createCsv(cellData, rowData);
  }

  // Extended methods need to implement only this method
  // Sanity check of data and defaulting is done in generate method
  protected abstract createCsv(cellData: unknown, rowData?: unknown): string | Dictionary<string>;
}
//
// export interface CellCsvGeneratorConfig {
//   createCsv: (cellData: unknown, rowData?: unknown) => string;
// }
