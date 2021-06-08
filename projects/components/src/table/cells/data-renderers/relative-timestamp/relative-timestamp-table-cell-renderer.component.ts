import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { DateFormatMode, DateFormatOptions, Dictionary } from '@hypertrace/common';
import { TableColumnConfig } from '../../../table-api';
import {
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_DATA_PARSER,
  TABLE_ROW_DATA
} from '../../table-cell-injection';
import { TableCellParserBase } from '../../table-cell-parser-base';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

export interface RowData extends Dictionary<unknown> {
  baseTimestamp: Date;
}
@Component({
  selector: 'ht-relative-timestamp-table-cell-renderer',
  styleUrls: ['./relative-timestamp-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative-timestamp"
      [htTooltip]="this.value | htDisplayDate: this.dateFormat"
      [ngClass]="{ 'first-column': this.isFirstColumn }"
    >
      {{ this.duration }} ms
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.RelativeTimestamp,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class RelativeTimestampTableCellRendererComponent extends TableCellRendererBase<Date> implements OnInit {
  public readonly dateFormat: DateFormatOptions = {
    mode: DateFormatMode.DateAndTimeWithSeconds
  };
  public readonly duration: number;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER)
    parser: TableCellParserBase<Date, Date, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: Date,
    @Inject(TABLE_ROW_DATA) rowData: RowData
  ) {
    super(columnConfig, index, parser, cellData, rowData);
    this.duration = cellData?.getTime() - rowData?.baseTimestamp?.getTime();
  }
}
