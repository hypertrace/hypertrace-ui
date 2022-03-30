import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, Renderer2 } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { catchError, finalize, take } from 'rxjs/operators';
import { ButtonSize, ButtonStyle } from '../button/button';
import { IconSize } from '../icon/icon-size';
import { NotificationService } from '../notification/notification.service';
import { DownloadFileMetadata } from './download-file-metadata';

@Component({
  selector: 'ht-download-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./download-file.component.scss'],
  template: `
    <div *ngIf="this.metadata" class="download-file" (click)="this.triggerDownload()">
      <ht-button
        *ngIf="!this.dataLoading"
        class="download-button"
        icon="${IconType.Download}"
        display="${ButtonStyle.Text}"
        size="${ButtonSize.Large}"
      ></ht-button>
      <ht-icon *ngIf="this.dataLoading" icon="${IconType.Loading}" size="${IconSize.Large}"></ht-icon>
    </div>
  `
})
export class DownloadFileComponent {
  @Input()
  public metadata?: DownloadFileMetadata;

  public dataLoading: boolean = false;
  private readonly dlJsonAnchorElement: HTMLAnchorElement;

  public constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly notificationService: NotificationService
  ) {
    this.dlJsonAnchorElement = this.document.createElement('a');
  }

  public triggerDownload(): void {
    this.dataLoading = true;
    this.metadata!.dataSource.pipe(
      take(1),
      catchError(() => this.notificationService.createFailureToast('Download failed')),
      finalize(() => {
        this.dataLoading = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe((data: string) => {
      this.downloadData(data);
    });
  }

  private downloadData(data: string): void {
    this.renderer.setAttribute(
      this.dlJsonAnchorElement,
      'href',
      `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`
    );
    this.renderer.setAttribute(this.dlJsonAnchorElement, 'download', this.metadata!.fileName);
    this.renderer.setAttribute(this.dlJsonAnchorElement, 'display', 'none');
    this.dlJsonAnchorElement.click();
  }
}
