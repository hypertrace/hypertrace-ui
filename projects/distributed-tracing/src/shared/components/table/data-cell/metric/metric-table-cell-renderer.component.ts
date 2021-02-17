import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormatterStyle } from '@hypertrace/common';
import {
  TableCellAlignmentType,
  TableCellParserBase,
  TableCellRenderer,
  TableCellRendererBase,
  TableColumnConfig,
  TableRow,
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_DATA_PARSER,
  TABLE_ROW_DATA
} from '@hypertrace/components';
import { MetricAggregation } from '../../../../../shared/graphql/model/metrics/metric-aggregation';
import { TracingTableCellType } from '../../tracing-table-cell-type';

@Component({
  selector: 'ht-metric-table-cell-renderer',
  styleUrls: ['./metric-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-cell" [htTooltip]="this.tooltip">
      <!-- This displays as "<value> <unit>", e.g. 120 ms -->
      <span
        >{{ this.value | htDisplayNumber: this.formatter }}
        <span *ngIf="this.value !== null && this.units">{{ this.units }}</span></span
      >
    </div>
  `
})
@TableCellRenderer({
  type: TracingTableCellType.Metric,
  alignment: TableCellAlignmentType.Right,
  parser: TracingTableCellType.Metric
})
export class MetricTableCellRendererComponent extends TableCellRendererBase<CellData, number> {
  public readonly formatter: FormatterStyle = FormatterStyle.None;

  // Extending constructor required with formatter declaration above
  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER) parser: TableCellParserBase<CellData, number, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: number | Partial<MetricAggregation>,
    @Inject(TABLE_ROW_DATA) rowData: TableRow
  ) {
    super(columnConfig, index, parser, cellData, rowData);
  }
}

type CellData = number | Partial<MetricAggregation>;
