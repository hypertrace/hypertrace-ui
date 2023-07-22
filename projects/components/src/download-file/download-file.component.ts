import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonSize, ButtonStyle } from '../button/button';
import { IconSize } from '../icon/icon-size';
import { DownloadFileMetadata } from './download-file-metadata';
import { FileDownloadService } from './service/file-download.service';

@Component({
  selector: 'ht-download-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./download-file.component.scss'],
  template: `
    <div *ngIf="this.metadata" class="download-file" (click)="this.triggerDownload(this.metadata)">
      <ht-button
        *ngIf="!this.dataLoading"
        class="download-button"
        icon="${IconType.Download}"
        display="${ButtonStyle.Text}"
        size="${ButtonSize.Large}"
        ariaLabel="Download"
      ></ht-button>
      <ht-icon *ngIf="this.dataLoading" icon="${IconType.Loading}" size="${IconSize.Large}"></ht-icon>
    </div>
  `
})
export class DownloadFileComponent {
  @Input()
  public metadata?: DownloadFileMetadata;

  public dataLoading: boolean = false;

  public constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly fileDownloadService: FileDownloadService
  ) {}

  public triggerDownload(metadata: DownloadFileMetadata): void {
    this.dataLoading = true;
    this.fileDownloadService.downloadAsText(metadata).subscribe(() => {
      this.dataLoading = false;
      this.cdr.detectChanges();
    });
  }
}
