import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { DateCoercer } from '@hypertrace/common';
import {
  CoreTableCellParserType,
  TableCellAlignmentType,
  TableCellParserBase,
  TableCellRenderer,
  TableCellRendererBase,
  TableColumnConfig,
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_DATA_PARSER,
  TABLE_ROW_DATA
} from '@hypertrace/components';
import { LogEvent } from '@hypertrace/distributed-tracing';
import { ObservabilityTableCellType } from '../../observability-table-cell-type';

@Component({
  selector: 'ht-log-timestamp-table-cell-renderer',
  styleUrls: ['./log-timestamp-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="log-timestamp" [htTooltip]="tooltip" [ngClass]="{ 'first-column': this.isFirstColumn }">
      {{ this.duration }}
    </div>
    <ng-template #tooltip>{{ this.readableDateTime }}</ng-template>
  `
})
@TableCellRenderer({
  type: ObservabilityTableCellType.LogTimestamp,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class LogTimestampTableCellRendererComponent extends TableCellRendererBase<string> implements OnInit {
  public readonly spanStartTime: number;
  public readonly timestamp?: string;
  public readonly duration?: string;
  public readonly readableDateTime?: string;

  private readonly dateCoercer = new DateCoercer();

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER)
    parser: TableCellParserBase<string, string, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: any,
    @Inject(TABLE_ROW_DATA) rowData: LogEvent
  ) {
    super(columnConfig, index, parser, cellData, rowData);
    this.spanStartTime = rowData.spanStartTime as number;
    this.timestamp = rowData.timestamp;
    this.readableDateTime =
      this.timestamp
        ?.replace('T', ' ')
        .replace('Z', ' ')
        .replace(/-/g, '/')
        .substr(0, this.timestamp.length - 8) + this.getDecimalMilliSeconds(this.timestamp, 3);

    const date: Date = this.dateCoercer.coerce(this.timestamp) ?? new Date();
    const decimalMilliseconds: string = this.getDecimalMilliSeconds(this.timestamp, 2);
    this.duration = date.getTime() - this.spanStartTime + decimalMilliseconds + ' ms';
  }

  private getDecimalMilliSeconds(timestamp: string = '', precision: number): string {
    return String(Number('0.' + timestamp.substr(timestamp.length - 7, 6)).toFixed(precision)).substring(1);
  }
}
