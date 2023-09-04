import { Injectable } from '@angular/core';
import { TableColumnConfig, TableDataSource, TableRow } from '@hypertrace/components';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalCsvDownloadService {
  // Note: This service should be use to connect and donwload data from two unrelated components. The component's data to be downloaded should be register and can be executed from a different component.

  private readonly csvDataSourceMap: Map<string, GlobalCsvDownloadData> = new Map();

  public registerDataSource(key: string, source: GlobalCsvDownloadData): void {
    if (this.csvDataSourceMap.has(key)) {
      this.csvDataSourceMap.delete(key);
    }

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

export interface GlobalCsvDownloadData {
  columns: TableColumnConfig[];
  getData: Observable<TableDataSource<TableRow>>;
}
