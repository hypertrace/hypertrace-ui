import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableRowState } from '../../../table-api';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-table-checkbox-cell-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row-checkbox-cell">
      <ht-checkbox [checked]="this.value.selected"></ht-checkbox>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Checkbox,
  alignment: TableCellAlignmentType.Center,
  parser: CoreTableCellParserType.Checkbox
})
export class TableCheckboxCellRendererComponent extends TableCellRendererBase<TableRowState> {}
