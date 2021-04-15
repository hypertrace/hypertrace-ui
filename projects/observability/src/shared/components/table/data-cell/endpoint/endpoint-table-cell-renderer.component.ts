import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import {
  CoreTableCellParserType,
  IconSize,
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
import { Trace } from '@hypertrace/distributed-tracing';
import { ObservabilityTableCellType } from '../../observability-table-cell-type';

interface CellData {
  units: number;
  value: [string, number];
}

@Component({
  selector: 'ht-endpoint-table-cell-renderer',
  styleUrls: ['./endpoint-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="endpoint">
      <div class="endpoint-value" [htTooltip]="this.endpointValue">{{ this.endpointValue }}</div>
      <ht-icon
        *ngIf="this.errorCount > 0"
        class="error-icon"
        icon="${IconType.Error}"
        size="${IconSize.Medium}"
        color="${Color.Red5}"
      ></ht-icon>
    </div>
  `
})
@TableCellRenderer({
  type: ObservabilityTableCellType.Endpoint,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class EndpointTableCellRendererComponent extends TableCellRendererBase<CellData, Trace> implements OnInit {
  public readonly endpointValue: string;
  public readonly errorCount: number;
  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER) parser: TableCellParserBase<CellData, Trace, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: CellData,
    @Inject(TABLE_ROW_DATA) rowData: Trace
  ) {
    super(columnConfig, index, parser, cellData, rowData);
    this.endpointValue = cellData.value[0];
    this.errorCount = cellData.value[1];
  }
}
