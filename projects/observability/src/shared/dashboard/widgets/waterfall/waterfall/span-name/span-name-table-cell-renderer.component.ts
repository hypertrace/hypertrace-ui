import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { IconSize, TableCellAlignmentType, TableCellRenderer, TableCellRendererBase } from '@hypertrace/components';
import { SpanNameCellData } from './span-name-cell-data';
import { WaterfallTableCellType } from './span-name-cell-type';

@Component({
  selector: 'ht-span-name-table-cell-renderer',
  styleUrls: ['./span-name-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-title" [htTooltip]="this.tooltip" [ngClass]="{ clickable: this.clickable }">
      <div class="color-bar" [style.backgroundColor]="this.value.color" *ngIf="this.value.color"></div>
      <div class="service-name">
        <span class="text" data-sensitive-pii>{{ this.value.serviceName }}</span>
      </div>
      <div class="protocol-name" *ngIf="this.value.protocolName">
        <span class="text" data-sensitive-pii>{{ this.value.protocolName }}</span>
      </div>
      <div class="span-name">
        <span class="text" data-sensitive-pii>{{ this.value.apiName }}</span>
      </div>
      <ht-icon
        *ngIf="this.value.hasError"
        class="error-icon"
        icon="${IconType.Error}"
        size="${IconSize.Medium}"
        color="${Color.Red5}"
      ></ht-icon>
      <ht-icon
        *ngIf="this.value.hasLogs"
        class="log-icon"
        icon="${IconType.Note}"
        size="${IconSize.Small}"
        color="${Color.Gray4}"
      ></ht-icon>
    </div>
  `
})
@TableCellRenderer({
  type: WaterfallTableCellType.SpanName,
  alignment: TableCellAlignmentType.Left,
  parser: WaterfallTableCellType.SpanName
})
export class SpanNameTableCellRendererComponent extends TableCellRendererBase<SpanNameCellData> {}
