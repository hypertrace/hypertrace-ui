import { Injectable } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { CellCsvGenerator } from './csv-generators/cell-csv-generator';
import { isString } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class TableCsvMapperService<TDataTypeForTableRow> {
  // Each table should provide its own column to csv mapper config
  protected columnCsvMapperConfigMap: Map<keyof TDataTypeForTableRow, CellCsvGenerator> = new Map();

  public generateCsv(rows: Dictionary<unknown>[]): Dictionary<string | undefined>[] {
    return rows.map(row => {
      const rowValue: Dictionary<string | undefined> = {};

      Array.from(this.columnCsvMapperConfigMap.keys()).forEach(columnKey => {
        const value = row[columnKey as string];
        const csvGenerator = this.columnCsvMapperConfigMap.get(columnKey)!; // Safe to assert here since we are processing columns with valid csv generators only

        const csvContent = csvGenerator.generate(value, row);

        if (isString(csvContent)) {
          rowValue[columnKey as string] = csvContent;
        } else {
          Object.keys(csvContent).forEach(key => {
            rowValue[key] = csvContent[key];
          });
        }
      });

      return rowValue;
    });
  }
}
