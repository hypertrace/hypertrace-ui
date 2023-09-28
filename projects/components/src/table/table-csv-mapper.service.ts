import { Injectable, InjectionToken } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { TableRow } from './table-api';

export const TABLE_COLUMN_CSV_MAPPER = new InjectionToken<TableCsvMapperService>('Table Column CSV Mapper Service');

@Injectable({ providedIn: 'root' })
export class TableCsvMapperService {
  // Each table should provide its own column to csv mapper config
  protected readonly columnCsvMapperConfigMap: Map<
    ColumnId,
    (cellData?: unknown, rowData?: unknown) => string | undefined
  > = new Map();

  public generateCsv(rows: TableRow[]): Dictionary<string | undefined>[] {
    return rows.map(row => {
      const rowValue: Dictionary<string | undefined> = {};
      Array.from(this.columnCsvMapperConfigMap.keys()).forEach(columnKey => {
        const value = row[columnKey];
        const csvGenerator = this.columnCsvMapperConfigMap.get(columnKey)!; // Safe to assert here since we are processing columns with valid csv generators only

        rowValue[columnKey] = csvGenerator(value, row);
      });

      return rowValue;
    });
  }
}

type ColumnId = string;
