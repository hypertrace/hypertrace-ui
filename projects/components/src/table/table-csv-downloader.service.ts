import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableCsvDownloaderService {
  private readonly csvDownloadRequestSubject: BehaviorSubject<string | undefined> = new BehaviorSubject<
    string | undefined
  >(undefined);

  public csvDownloadRequest$: Observable<string | undefined> = this.csvDownloadRequestSubject.asObservable();

  public triggerDownload(tableId: string): void {
    this.csvDownloadRequestSubject.next(tableId);
  }
}
