import { capitalize } from 'lodash-es';
import { CellCsvGenerator } from './cell-csv-generator';

export class StringCsvGenerator extends CellCsvGenerator {
  public constructor(private readonly textType: StringType = 'enum') {
    super();
  }

  public createCsv(cellData: string): string {
    return this.textType === 'enum' ? capitalize(cellData) : cellData;
  }
}

type StringType = 'enum' | 'string';
