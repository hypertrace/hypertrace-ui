import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableRowState } from '../../../table-api';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'htc-table-checkbox-cell-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row-checkbox-cell">
      <htc-checkbox [checked]="this.value.selected"></htc-checkbox>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Checkbox,
  alignment: TableCellAlignmentType.Center,
  parser: CoreTableCellParserType.State
})
export class TableCheckboxCellRendererComponent extends TableCellRendererBase<TableRowState> {}
