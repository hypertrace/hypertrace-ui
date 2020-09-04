import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellAlignmentType, TableCellRenderer, TableCellRendererBase } from '@hypertrace/components';
import { TraceStatus } from '../../../../../shared/graphql/model/schema/trace';
import { TracingTableCellType } from '../../tracing-table-cell-type';

@Component({
  selector: 'ht-status-table-cell-renderer',
  styleUrls: ['./trace-status-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="trace-status" [htTooltip]="this.value.status" [ngClass]="{ clickable: this.clickable }">
      <div class="status" [ngClass]="this.value.status.toString().toLowerCase()">
        <span class="text">{{ this.value.statusCode }} - {{ this.value.statusMessage }}</span>
      </div>
    </div>
  `
})
@TableCellRenderer({
  type: TracingTableCellType.TraceStatus,
  alignment: TableCellAlignmentType.Left,
  parser: TracingTableCellType.TraceStatus
})
export class TraceStatusTableCellRendererComponent extends TableCellRendererBase<TraceStatus> {}
