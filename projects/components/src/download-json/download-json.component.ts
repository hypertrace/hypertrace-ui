import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, Renderer2 } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { ButtonSize, ButtonStyle } from '../button/button';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'ht-download-json',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./download-json.component.scss'],
  template: `
    <div class="download-json" [htTooltip]="this.tooltip" (click)="this.triggerDownload()">
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
export class DownloadJsonComponent {
  @Input()
  public dataSource!: Observable<unknown>;

  @Input()
  public fileName: string = 'download';

  @Input()
  public tooltip: string = 'Download Json';

  public dataLoading: boolean = false;
  private readonly dlJsonAnchorElement: HTMLAnchorElement;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly notificationService: NotificationService
  ) {
    this.dlJsonAnchorElement = this.document.createElement('a');
  }

  public triggerDownload(): void {
    this.dataLoading = true;
    this.dataSource
      .pipe(
        take(1),
        catchError(() => this.notificationService.createFailureToast('Download failed')),
        finalize(() => {
          this.dataLoading = false;
          this.changeDetector.detectChanges();
        })
      )
      .subscribe((data: unknown) => {
        if (typeof data === 'string') {
          this.downloadData(data);
        } else {
          this.downloadData(JSON.stringify(data));
        }
      });
  }

  private downloadData(data: string): void {
    this.renderer.setAttribute(
      this.dlJsonAnchorElement,
      'href',
      `data:text/json;charset=utf-8,${encodeURIComponent(data)}`
    );
    this.renderer.setAttribute(this.dlJsonAnchorElement, 'download', `${this.fileName}.json`);
    this.renderer.setAttribute(this.dlJsonAnchorElement, 'display', 'none');
    this.dlJsonAnchorElement.click();
  }
}
