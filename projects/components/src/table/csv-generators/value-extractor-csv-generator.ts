import { CellCsvGenerator } from './cell-csv-generator';
import { Dictionary } from '@hypertrace/common';
import { isArray } from 'lodash-es';

export class ValueExtractorCsvGenerator extends CellCsvGenerator {
  public constructor(private readonly keyName: string) {
    super();
  }

  protected createCsv(cellData: Dictionary<unknown> | Dictionary<unknown>[]): string {
    if (isArray(cellData)) {
      return cellData.map(data => data[this.keyName] ?? '').join(', ');
    }

    return (cellData[this.keyName] as string) ?? '';
  }
}
