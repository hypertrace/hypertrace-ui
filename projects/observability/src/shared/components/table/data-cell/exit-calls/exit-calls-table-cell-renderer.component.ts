import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
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
import { Trace } from '@hypertrace/distributed-tracing';
import { ExploreValue } from '@hypertrace/observability';
import { ObservabilityTableCellType } from '../../observability-table-cell-type';

@Component({
  selector: 'ht-exit-calls-table-cell-renderer',
  styleUrls: ['./exit-calls-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="exit-calls-cell" [htTooltip]="exitCallsTooltip">
      <span class="exit-calls-count">{{ this.apiExitCalls }}</span>

      <ng-template #exitCallsTooltip>
        <ng-container *ngIf="this.apiExitCalls > 0">
          <div *ngFor="let item of this.apiCalleeNameCount" class="api-callee-name-count">
            <span class="api-callee-name">{{ item[0] }}</span>
            <span class="api-callee-count">{{ item[1] }}</span>
          </div>
          <div
            *ngIf="this.totalCountOfDifferentApiCallee > this.maxShowApiCalleeNameCount"
            class="remaining-api-callee"
          >
            and {{ this.totalCountOfDifferentApiCallee - this.maxShowApiCalleeNameCount }} more
          </div>
        </ng-container>
        <ng-container *ngIf="this.apiExitCalls <= 0" class="no-exit-calls">No exit calls</ng-container>
      </ng-template>
    </div>
  `
})
@TableCellRenderer({
  type: ObservabilityTableCellType.ExitCalls,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class ExitCallsTableCellRendererComponent extends TableCellRendererBase<ExploreValue, Trace> implements OnInit {
  public readonly apiCalleeNameCount: string[][];
  public readonly apiExitCalls: number;
  public readonly maxShowApiCalleeNameCount: number = 10;
  public readonly totalCountOfDifferentApiCallee!: number;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER) parser: TableCellParserBase<ExploreValue, Trace, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: ExploreValue,
    @Inject(TABLE_ROW_DATA) rowData: Trace
  ) {
    super(columnConfig, index, parser, cellData, rowData);
    const apiCalleeNameCount: string[][] = Object.entries(Object(rowData.apiCalleeNameCount));
    this.totalCountOfDifferentApiCallee = apiCalleeNameCount.length;
    this.apiCalleeNameCount = apiCalleeNameCount.slice(0, this.maxShowApiCalleeNameCount);
    this.apiExitCalls = Number(rowData.apiExitCalls);
  }
}
