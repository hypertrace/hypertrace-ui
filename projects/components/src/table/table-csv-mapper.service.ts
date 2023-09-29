import { Injectable } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { CellCsvGenerator } from './csv-generators/cell-csv-generator';

@Injectable({ providedIn: 'root' })
export class TableCsvMapperService<TKeyType> {
  // Each table should provide its own column to csv mapper config
  private readonly columnCsvMapperConfigMap: Map<TKeyType, CellCsvGenerator>;

  public constructor(mappers: [TKeyType, CellCsvGenerator][]) {
    this.columnCsvMapperConfigMap = new Map(mappers);
  }

  public generateCsv(rows: Dictionary<unknown>[]): Dictionary<string | undefined>[] {
    return rows.map(row => {
      const rowValue: Dictionary<string | undefined> = {};
      Array.from(this.columnCsvMapperConfigMap.keys()).forEach(columnKey => {
        const value = row[columnKey as string];
        const csvGenerator = this.columnCsvMapperConfigMap.get(columnKey)!; // Safe to assert here since we are processing columns with valid csv generators only

        rowValue[columnKey as string] = csvGenerator.generate(value, row);
      });

      return rowValue;
    });
  }
}
