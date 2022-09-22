import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ButtonSize, ButtonStyle } from '../button/button';
import { IconSize } from '../icon/icon-size';
import { DownloadFileMetadata } from './download-file-metadata';
import { FileDownloadEventType, FileDownloadService } from './service/file-download.service';

@Component({
  selector: 'ht-download-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./download-file.component.scss'],
  providers: [FileDownloadService],
  template: `
    <div *ngIf="this.metadata" class="download-file" (click)="this.triggerDownload()">
      <ht-button
        *ngIf="!(this.dataLoading$ | async)"
        class="download-button"
        icon="${IconType.Download}"
        display="${ButtonStyle.Text}"
        size="${ButtonSize.Large}"
      ></ht-button>
      <ht-icon *ngIf="this.dataLoading$ | async" icon="${IconType.Loading}" size="${IconSize.Large}"></ht-icon>
    </div>
  `
})
export class DownloadFileComponent {
  @Input()
  public metadata?: DownloadFileMetadata;

  public constructor(private readonly fileDownloadService: FileDownloadService) {}

  public get dataLoading$(): Observable<boolean> {
    return this.fileDownloadService.fileDownloadEvent$.pipe(map(event => event === FileDownloadEventType.Progress));
  }

  public triggerDownload(): void {
    this.fileDownloadService.downloadAsText(this.metadata!);
  }
}
