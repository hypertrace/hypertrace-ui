import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
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
import { ObservabilityTableCellType } from '../../observability-table-cell-type';

interface CellData {
  units: number;
  value: [number, Dictionary<string>];
}
@Component({
  selector: 'ht-exit-calls-table-cell-renderer',
  styleUrls: ['./exit-calls-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="exit-calls-cell" [htTooltip]="exitCallsTooltip">
      <span class="exit-calls-count">{{ this.apiExitCalls }}</span>

      <ng-template #exitCallsTooltip>
        <ng-container *ngIf="this.apiExitCalls > 0; else noExitCalls">
          <div *ngFor="let item of this.apiCalleeNameEntries" class="api-callee-name-entries">
            <span class="api-callee-name">{{ item[0] }}</span>
            <span class="api-callee-count">{{ item[1] }}</span>
          </div>
          <div
            *ngIf="this.uniqueApiCallee > ${ExitCallsTableCellRendererComponent.MAX_API_CALLEE_TO_SHOW}"
            class="remaining-api-callee"
          >
            and {{ this.uniqueApiCallee - ${ExitCallsTableCellRendererComponent.MAX_API_CALLEE_TO_SHOW} }} more
          </div>
        </ng-container>
        <ng-template #noExitCalls>No exit calls</ng-template>
      </ng-template>
    </div>
  `
})
@TableCellRenderer({
  type: ObservabilityTableCellType.ExitCalls,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class ExitCallsTableCellRendererComponent extends TableCellRendererBase<CellData, Trace> implements OnInit {
  public static readonly MAX_API_CALLEE_TO_SHOW: number = 10;
  public readonly apiCalleeNameEntries: [string, string][];
  public readonly apiExitCalls: number;
  public readonly uniqueApiCallee: number;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER)
    parser: TableCellParserBase<CellData, Trace, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: CellData,
    @Inject(TABLE_ROW_DATA) rowData: Trace
  ) {
    super(columnConfig, index, parser, cellData, rowData);
    const apiCalleeNameEntries: [string, string][] = Object.entries(cellData.value[1]);
    this.uniqueApiCallee = apiCalleeNameEntries.length;
    this.apiCalleeNameEntries = apiCalleeNameEntries.slice(
      0,
      ExitCallsTableCellRendererComponent.MAX_API_CALLEE_TO_SHOW
    );
    this.apiExitCalls = cellData.value[0];
  }
}
