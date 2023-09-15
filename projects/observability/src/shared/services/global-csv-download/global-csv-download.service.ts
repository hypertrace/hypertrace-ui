import { Injectable } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import {
  CsvDownloadFileConfig,
  FileDownloadService,
  TableColumnConfig,
  TableDataSource,
  TableRow
} from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalCsvDownloadService {
  // Note: This service should be use to connect and donwload data from two unrelated components. The component's data to be downloaded should be register and can be executed from a different component.

  private readonly csvDataSourceMap: Map<string, GlobalCsvDownloadData> = new Map();

  public constructor(private readonly fileDownloadService: FileDownloadService) {}

  public downloadCsv(csvDownloadFileConfig?: CsvDownloadFileConfig): Observable<unknown> {
    return !isNil(csvDownloadFileConfig)
      ? this.fileDownloadService.downloadAsCsv(csvDownloadFileConfig)
      : throwError('No data available.');
  }

  public registerDataSource(key: string, source: GlobalCsvDownloadData): void {
    this.csvDataSourceMap.set(key, source);
  }

  public getRegisteredDataSource(key: string): GlobalCsvDownloadData | undefined {
    return this.csvDataSourceMap.get(key);
  }

  public hasRegisteredDataSource(key: string): boolean {
    return this.csvDataSourceMap.has(key);
  }

  public deleteRegisteredDataSource(key: string): void {
    if (this.csvDataSourceMap.has(key)) {
      this.csvDataSourceMap.delete(key);
    }
  }

  public clearAllDataSource(): void {
    this.csvDataSourceMap.clear();
  }
}

export type GlobalCsvDownloadData = GlobalCsvDownloadTableDataSource | GlobalCsvDownloadDataSource;

export const enum GlobalCsvDownloadDataType {
  Table = 'table',
  DataSource = 'datasource'
}
export interface GlobalCsvDownloadTableDataSource {
  type: GlobalCsvDownloadDataType.Table;
  columns: TableColumnConfig[];
  data: Observable<TableDataSource<TableRow>>;
}

export interface GlobalCsvDownloadDataSource {
  type: GlobalCsvDownloadDataType.DataSource;
  data: Observable<Dictionary<unknown>[]>;
}
