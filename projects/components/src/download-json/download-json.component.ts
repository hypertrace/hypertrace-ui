import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { ButtonSize, ButtonStyle } from '../button/button';

@Component({
  selector: 'ht-download-json',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./download-json.component.scss'],
  template: `
    <div class="download-json">
      <ht-button
        *ngIf="!this.dataLoading"
        class="download-json"
        icon="${IconType.Download}"
        display="${ButtonStyle.Text}"
        size="${ButtonSize.Large}"
        [htTooltip]="this.tooltip"
        (click)="this.triggerDownload()"
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

  public triggerDownload(): void {
    this.dataLoading = true;
    this.dataSource.subscribe((data: unknown) => {
      this.dataLoading = false;
      if (typeof data === 'string') {
        this.downloadData(data);
      } else {
        this.downloadData(JSON.stringify(data));
      }
    });
  }

  private downloadData(data: string): void {
    const dlJsonAnchorElement: HTMLAnchorElement = document.createElement('a');
    const downloadURL = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;
    dlJsonAnchorElement?.setAttribute('href', downloadURL);
    dlJsonAnchorElement?.setAttribute('href', downloadURL);
    dlJsonAnchorElement?.setAttribute('download', `${this.fileName}.json`);
    dlJsonAnchorElement.click();
    dlJsonAnchorElement.remove();
  }
}
