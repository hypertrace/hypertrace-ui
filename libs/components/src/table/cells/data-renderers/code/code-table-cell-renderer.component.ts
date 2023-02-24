import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-code-table-cell-renderer',
  styleUrls: ['./code-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-cell" [htTooltip]="this.value | htDisplayString">
      {{ this.value | htDisplayString }}
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Code,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.String
})
export class CodeTableCellRendererComponent extends TableCellRendererBase<string> {}
