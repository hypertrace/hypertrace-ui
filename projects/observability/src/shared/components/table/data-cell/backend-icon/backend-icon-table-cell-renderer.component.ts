import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconSize, TableCellAlignmentType, TableCellRenderer, TableCellRendererBase } from '@hypertrace/components';
import { ObservabilityTableCellType } from '../../observability-table-cell-type';

@Component({
  selector: 'ht-backend-icon-table-cell-renderer',
  styleUrls: ['./backend-icon-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icon-cell" [ngClass]="{ clickable: this.clickable }">
      <htc-icon class="icon" [icon]="this.value" size="${IconSize.Medium}" [showTooltip]="true"></htc-icon>
    </div>
  `
})
@TableCellRenderer({
  type: ObservabilityTableCellType.BackendIcon,
  alignment: TableCellAlignmentType.Center,
  parser: ObservabilityTableCellType.BackendIcon
})
export class BackendIconTableCellRendererComponent extends TableCellRendererBase<string> {}
