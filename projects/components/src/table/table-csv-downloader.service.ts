import { EMPTY, Observable, of, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { TableColumnConfigExtended } from './table.service';
import { TableRow } from './table-api';
import { CsvFileName, FileDownloadService } from '../download-file/service/file-download.service';
import { map, switchMap, take } from 'rxjs/operators';
import { isEmpty, isNil, isString } from 'lodash-es';
import { Dictionary } from '@hypertrace/common';
import { NotificationService } from '../notification/notification.service';

@Injectable({ providedIn: 'root' })
export class TableCsvDownloaderService {
  private readonly csvDownloadRequestSubject: Subject<string> = new Subject<string>();
  public csvDownloadRequest$: Observable<string> = this.csvDownloadRequestSubject.asObservable();

  public constructor(
    private readonly fileDownloadService: FileDownloadService,
    private readonly notificationService: NotificationService
  ) {}

  public triggerDownload(tableId: string): void {
    this.csvDownloadRequestSubject.next(tableId);
  }

  public executeDownload(
    dataAndConfigs$: Observable<{ rows: TableRow[]; columnConfigs: TableColumnConfigExtended[] }>,
    fileName: CsvFileName
  ): void {
    dataAndConfigs$
      .pipe(
        map(({ rows, columnConfigs }) => {
          const csvGeneratorMap = new Map(
            columnConfigs.filter(column => !isNil(column.csvGenerator)).map(column => [column.id, column])
          );

          return rows
            .map(row => {
              let rowValue: Dictionary<string | undefined> = {};
              Array.from(csvGeneratorMap.keys()).forEach(columnKey => {
                const columnConfig: TableColumnConfigExtended = csvGeneratorMap.get(columnKey)!; // Safe to assert since all columns will have a config
                const csvGenerator = columnConfig.csvGenerator!; // Safe to assert here since we are processing columns with valid csv generators only
                const value = row[columnKey];

                const csvContent = csvGenerator.generateSafeCsv(value, row);

                if (!isNil(csvContent)) {
                  if (isString(csvContent)) {
                    rowValue[columnConfig.title ?? columnConfig.name ?? columnConfig.id] = csvContent;
                  } else {
                    rowValue = { ...rowValue, ...csvContent };
                  }
                }
              });

              return rowValue;
            })
            .filter(row => !isEmpty(row));
        }),
        switchMap((content: Dictionary<string | undefined>[]) => {
          if (isEmpty(content)) {
            this.notificationService.createInfoToast('No data to download');

            return EMPTY;
          }

          return this.fileDownloadService.downloadAsCsv({
            fileName: fileName,
            dataSource: of(content)
          });
        }),
        take(1)
      )
      .subscribe();
  }
}
