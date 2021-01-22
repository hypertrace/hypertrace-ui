import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellAlignmentType, TableCellRenderer, TableCellRendererBase } from '@hypertrace/components';
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
        <span class="text" data-sensitive-pii>{{ this.value.name }}</span>
      </div>
    </div>
  `
})
@TableCellRenderer({
  type: WaterfallTableCellType.SpanName,
  alignment: TableCellAlignmentType.Left,
  parser: WaterfallTableCellType.SpanName
})
export class SpanNameTableCellRendererComponent extends TableCellRendererBase<SpanNameCellData> {}
