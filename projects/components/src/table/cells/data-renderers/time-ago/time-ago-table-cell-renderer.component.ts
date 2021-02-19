import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-timestamp-table-cell-renderer',
  styleUrls: ['./time-ago-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cell-value" [htTooltip]="this.value | htDisplayTimeAgo">
      {{ this.value | htDisplayTimeAgo }}
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.TimeAgo,
  alignment: TableCellAlignmentType.Right,
  parser: CoreTableCellParserType.Timestamp
})
export class TimeAgoTableCellRendererComponent extends TableCellRendererBase<Date | number> {}
