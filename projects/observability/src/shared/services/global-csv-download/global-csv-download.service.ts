import { Injectable } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import {
  CsvDownloadFileConfig,
  FileDownloadService,
  TableColumnConfig,
  TableDataResponse,
  TableDataSource,
  TableRow,
  TableSortDirection
} from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GlobalCsvDownloadTableService {
  // Note: This service should be use to connect and donwload data from two unrelated components. The component's data to be downloaded should be register and can be executed from a different component.

  private readonly csvDataSourceMap: Map<string, GlobalCsvDownloadTableData> = new Map();

  public constructor(private readonly fileDownloadService: FileDownloadService) {}

  public downloadCsv(key: string, fileName: string, parser: GlobalCsvDownloadTableRowParser): Observable<unknown> {
    if (!this.hasRegisteredDataSource(key)) {
      throwError('No data available.');
    }

    const csvDownloadFileConfig: CsvDownloadFileConfig = this.getCsvDownloadFileConfig(
      fileName,
      this.csvDataSourceMap.get(key)!,
      parser
    );

    return !isNil(csvDownloadFileConfig)
      ? this.fileDownloadService.downloadAsCsv(csvDownloadFileConfig)
      : throwError('No data available.');
  }

  public registerDataSource(key: string, source: GlobalCsvDownloadTableData): void {
    this.csvDataSourceMap.set(key, source);
  }

  public getRegisteredDataSource(key: string): GlobalCsvDownloadTableData | undefined {
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

  private getCsvDownloadFileConfig(
    fileName: string,
    downloadData: GlobalCsvDownloadTableData,
    parser: GlobalCsvDownloadTableRowParser
  ): CsvDownloadFileConfig {
    return {
      fileName: `${fileName}.csv`,
      dataSource: downloadData.data.pipe(
        switchMap(sourceData => this.getDownloadableData(sourceData, downloadData.columns)),
        map(result => result.data.map(row => parser.parse(row)))
      )
    };
  }

  private getDownloadableData(
    sourceData: TableDataSource<TableRow>,
    columns: TableColumnConfig[]
  ): Observable<TableDataResponse<TableRow>> {
    const sortedByColumn = columns.find(column => column.sort !== undefined);

    return sourceData.getData({
      columns: columns,
      position: {
        startIndex: 0,
        limit: 10000
      },
      ...(sortedByColumn !== undefined
        ? {
            sort: {
              column: sortedByColumn,
              direction: sortedByColumn.sort === 'DESC' ? TableSortDirection.Descending : TableSortDirection.Ascending
            }
          }
        : undefined)
    });
  }
}

export interface GlobalCsvDownloadTableData {
  columns: TableColumnConfig[];
  data: Observable<TableDataSource<TableRow>>;
}

export interface GlobalCsvDownloadTableRowParser {
  parse: (row: TableRow) => Dictionary<unknown>;
}
