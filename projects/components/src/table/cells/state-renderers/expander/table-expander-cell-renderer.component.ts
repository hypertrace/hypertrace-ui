import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableRowState } from '../../../table-api';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'htc-table-expander-cell-renderer',
  styleUrls: ['./table-expander-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row-expander-cell">
      <htc-expander-toggle
        *ngIf="!this.value.leaf"
        [expanded]="this.value.expanded"
        [showTooltip]="false"
      ></htc-expander-toggle>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.RowExpander,
  alignment: TableCellAlignmentType.Center,
  parser: CoreTableCellParserType.State
})
export class TableExpanderCellRendererComponent extends TableCellRendererBase<TableRowState> {}
