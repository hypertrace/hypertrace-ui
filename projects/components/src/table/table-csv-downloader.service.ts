import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableCsvDownloaderService {
  private readonly csvDownloadRequestSubject: Subject<string> = new Subject<string>();
  public csvDownloadRequest$: Observable<string> = this.csvDownloadRequestSubject.asObservable();

  public triggerDownload(tableId: string): void {
    this.csvDownloadRequestSubject.next(tableId);
  }
}
