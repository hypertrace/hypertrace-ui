import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconSize } from '../../../../icon/icon-size';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-icon-table-cell-renderer',
  styleUrls: ['./icon-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icon-cell" [ngClass]="{ clickable: this.clickable }">
      <ht-icon [icon]="this.value" size="${IconSize.Small}" [showTooltip]="true"></ht-icon>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Icon,
  alignment: TableCellAlignmentType.Center,
  parser: CoreTableCellParserType.Icon
})
export class IconTableCellRendererComponent extends TableCellRendererBase<string> {}
