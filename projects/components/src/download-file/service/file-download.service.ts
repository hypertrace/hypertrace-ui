import { Injectable, OnDestroy } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { isEmpty, startCase } from 'lodash';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class FileDownloadService implements OnDestroy {
  private readonly downloadElement: HTMLAnchorElement;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly fileDownloadEventSubject: BehaviorSubject<FileDownloadEventType | undefined> = new BehaviorSubject<
    FileDownloadEventType | undefined
  >(undefined);

  public readonly fileDownloadEvent$: Observable<
    FileDownloadEventType | undefined
  > = this.fileDownloadEventSubject.asObservable();

  public constructor(private readonly notificationService: NotificationService) {
    this.downloadElement = this.createDownloadElement();
  }

  /**
   * Downloads data as text file
   * @param config Text download config
   */
  public downloadAsText(config: FileDownloadBaseConfig): void {
    this.download({ ...config }, data => `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
  }

  /**
   * Downloads data as csv file
   * @param config Csv download config
   */
  public downloadAsCsv(config: CsvDownloadFileConfig): void {
    // if given header is empty, then creates header from the data keys
    const header$ = isEmpty(config.header)
      ? config.dataSource.pipe(
          map(data => Object.keys(data[0] ?? [])),
          map(keys => keys.map(key => startCase(key)))
        )
      : of(config.header!);

    const values$ = config.dataSource.pipe(map(data => data.map(datum => Object.values(datum))));

    // Creates csv data as string
    const csvData$ = combineLatest([header$, values$]).pipe(
      map(([header, values]) => [header, ...values]),
      map(data => data.map(d => d.join(',')).join('\n'))
    );

    this.download({ ...config, dataSource: csvData$ }, csvData => {
      const csvFile = new Blob([csvData], { type: 'text/csv' });
      return window.URL.createObjectURL(csvFile);
    });
  }

  public ngOnDestroy(): void {
    this.downloadElement.remove();
    this.subscriptions.unsubscribe();
  }

  private createDownloadElement(): HTMLAnchorElement {
    const downloadElem = document.createElement('a');
    downloadElem.setAttribute('display', 'none');
    document.body.appendChild(downloadElem);

    return downloadElem;
  }

  /**
   * Subscribes to the data and starts the download
   * @param config File download base config
   * @param getHref Href provider to download
   * @param fileType Download File Type
   */
  private download(config: FileDownloadBaseConfig, getHref: (data: string) => string): void {
    this.fileDownloadEventSubject.next(FileDownloadEventType.Progress);

    this.subscriptions.add(
      config.dataSource
        .pipe(
          take(1),
          catchError(() => {
            this.fileDownloadEventSubject.next(FileDownloadEventType.Failure);

            return this.notificationService.createFailureToast(config.failureMsg ?? 'File download failed');
          })
        )
        .subscribe(data => {
          try {
            this.downloadElement.href = getHref(data);
            this.downloadElement.download = config.fileName;
            this.downloadElement.click();

            this.fileDownloadEventSubject.next(FileDownloadEventType.Success);
            this.notificationService.createSuccessToast(config.successMsg ?? 'File download successful');
          } catch (err) {
            this.fileDownloadEventSubject.next(FileDownloadEventType.Failure);
            this.notificationService.createFailureToast(config.failureMsg ?? 'File download failed');
          }
        })
    );
  }
}

export interface CsvDownloadFileConfig extends FileDownloadBaseConfig<Dictionary<string | number | boolean>[]> {
  header?: string[];
}

export interface FileDownloadBaseConfig<T = string> {
  dataSource: Observable<T>;
  fileName: string; // Include the file extension (.txt, .csv etc)
  successMsg?: string;
  failureMsg?: string;
}

export const enum FileDownloadEventType {
  Failure = 'failure',
  Progress = 'progress',
  Success = 'success'
}
