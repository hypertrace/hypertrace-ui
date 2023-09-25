import { Injectable, InjectionToken } from '@angular/core';

export const TABLE_COLUMN_CSV_MAPPER = new InjectionToken<TableCsvMapperService>('Table Column CSV Mapper Service');

@Injectable({ providedIn: 'root' })
export class TableCsvMapperService {
  // Each table should provide its own column to csv mapper config
  public columnCsvMapperConfigMap: Map<
    ColumnId,
    (cellData?: unknown, rowData?: unknown) => string | undefined
  > = new Map();
}

type ColumnId = string;
