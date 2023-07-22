import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonSize, ButtonStyle } from '@hypertrace/components';
import { SpanTitle } from '../../span-title';

@Component({
  selector: 'ht-span-detail-title-header',
  styleUrls: ['./span-detail-title-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="header">
      <!-- Left Side Title -->
      <div class="title" [htTooltip]="this.tooltip">
        <div class="service-name">
          <span class="text" data-sensitive-pii>{{ this.serviceName }}</span>
        </div>
        <div class="protocol-name">
          <span class="text" data-sensitive-pii>{{ this.protocolName }}</span>
        </div>
        <div class="api-name">
          <span class="text" data-sensitive-pii>{{ this.apiName }}</span>
        </div>
      </div>
      <!-- Right Side Button Controls -->
      <div class="controls">
        <ht-copy-shareable-link-to-clipboard
          class="share"
          size="${ButtonSize.Large}"
        ></ht-copy-shareable-link-to-clipboard>

        <div class="vertical-divider"></div>

        <ht-button
          class="close"
          size="${ButtonSize.Large}"
          icon="${IconType.CloseCircle}"
          display="${ButtonStyle.Outlined}"
          htTooltip="Close Details"
          (click)="this.closed.emit()"
        >
        </ht-button>
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
