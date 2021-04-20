import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-string-enum-table-cell-renderer',
  styleUrls: ['./string-enum-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="{ clickable: this.clickable, 'first-column': this.isFirstColumn }"
      class="string-enum-cell"
      [htTooltip]="this.value"
    >
      {{ this.value | htDisplayStringEnum }}
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.StringEnum,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.String
})
export class StringEnumTableCellRendererComponent extends TableCellRendererBase<string> {}
