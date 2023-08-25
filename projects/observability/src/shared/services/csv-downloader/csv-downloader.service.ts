import { Injectable } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { CsvDownloadFileConfig, FileDownloadService } from '@hypertrace/components';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CSVDownloaderService {
  private readonly componentHandlers: Map<string, Observable<Dictionary<unknown>[]>> = new Map();

  public constructor(private readonly fileDownloaderService: FileDownloadService) {}

  public downloadCsv(key: string, fileDownloadConfig?: CsvDownloadFileConfig): void {
    this.fileDownloaderService.downloadAsCsv({
      ...fileDownloadConfig,
      fileName: fileDownloadConfig?.fileName ?? 'file-name.csv',
      dataSource: this.componentHandlers.get(key) ?? of([])
    });
  }

  public registerHandler(key: string, source: Observable<Dictionary<unknown>[]>): void {
    if (!this.componentHandlers.has(key)) {
      this.componentHandlers.set(key, source);
    }
  }

  public hasRegisteredHandler(key: string): boolean {
    return this.componentHandlers.has(key);
  }

  public deleteRegisteredHandler(key: string): void {
    if (this.componentHandlers.has(key)) {
      this.componentHandlers.delete(key);
    }
  }

  public clearRegisteredHandler(): void {
    this.componentHandlers.clear();
  }
}
