import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonSize, ButtonStyle } from '@hypertrace/components';
import { SpanTitle } from '../../span-title';

@Component({
  selector: 'htc-span-detail-title-header',
  styleUrls: ['./span-detail-title-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="header">
      <!-- Left Side Title -->
      <div class="title" [htcTooltip]="this.tooltip">
        <div class="service-name">
          <span class="text">{{ this.serviceName }}</span>
        </div>
        <div class="protocol-name">
          <span class="text">{{ this.protocolName }}</span>
        </div>
        <div class="api-name">
          <span class="text">{{ this.apiName }}</span>
        </div>
      </div>
      <!-- Right Side Button Controls -->
      <div class="controls">
        <htc-copy-shareable-link-to-clipboard
          class="share"
          size="${ButtonSize.Large}"
        ></htc-copy-shareable-link-to-clipboard>

        <div class="divider"></div>

        <htc-button
          class="close"
          size="${ButtonSize.Large}"
          icon="${IconType.CloseCircle}"
          display="${ButtonStyle.Outlined}"
          htcTooltip="Close Details"
          (click)="this.closed.emit()"
        >
        </htc-button>
      </div>
    </div>
  `
})
export class SpanDetailTitleHeaderComponent implements OnChanges {
  @Input()
  public serviceName?: string;

  @Input()
  public protocolName?: string;

  @Input()
  public apiName?: string;

  @Output()
  public readonly closed: EventEmitter<void> = new EventEmitter<void>();

  public tooltip: string = '';

  public ngOnChanges(): void {
    this.tooltip = new SpanTitle(this.serviceName, this.protocolName, this.apiName).toString();
  }
}
