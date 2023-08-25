import { Injectable } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { CsvDownloadFileConfig, FileDownloadService } from '@hypertrace/components';
import { isEmpty } from 'lodash-es';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalCsvDownloadService {
  // Note: This service should be use to connect and donwload data from two unrelated components. The component's data to be downloaded should be register and can be executed from a different component.

  private readonly csvDataSourceMap: Map<string, Observable<Dictionary<unknown>[]>> = new Map();

  public constructor(private readonly fileDownloaderService: FileDownloadService) {}

  public downloadCsv(key: string, fileDownloadConfig?: CsvDownloadFileConfig): void {
    if (isEmpty(fileDownloadConfig)) {
      throw new Error('File download config should be defined.');
    } else {
      this.fileDownloaderService.downloadAsCsv({
        ...fileDownloadConfig,
        fileName: fileDownloadConfig?.fileName ?? 'download.csv',
        dataSource: this.csvDataSourceMap.get(key) ?? of([])
      });
    }
  }

  public registerDataSource(key: string, source: Observable<Dictionary<unknown>[]>): void {
    if (!this.csvDataSourceMap.has(key)) {
      this.csvDataSourceMap.set(key, source);
    }
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
