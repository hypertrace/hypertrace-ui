import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-string-array-table-cell-renderer',
  styleUrls: ['./string-array-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ht-string-array-display [values]="this.value"></ht-string-array-display> `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.StringArray,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class StringArrayTableCellRendererComponent extends TableCellRendererBase<string[]> implements OnInit {}
