import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-numeric-table-cell-renderer',
  styleUrls: ['./numeric-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="{ clickable: this.clickable }" class="numeric-cell" [htTooltip]="this.value">
      {{ this.value | htDisplayNumber }}
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Number,
  alignment: TableCellAlignmentType.Right,
  parser: CoreTableCellParserType.Number
})
export class NumericTableCellRendererComponent extends TableCellRendererBase<CellData, Value> {}

type CellData = number | { value: number };
type Value = number | undefined;
