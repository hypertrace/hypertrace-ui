import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-multiline-text-table-cell-renderer',
  styleUrls: ['./multiline-text-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="multiline-text-cell" [htTooltip]="this.value">
      {{ this.value | htDisplayString }}
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.MultilineText,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.String
})
export class MultilineTextTableCellRendererComponent extends TableCellRendererBase<string> {}
