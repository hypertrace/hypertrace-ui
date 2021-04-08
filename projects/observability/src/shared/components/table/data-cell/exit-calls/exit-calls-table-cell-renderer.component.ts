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

export const EXIT_CALLS_CELL = 'EXIT_CALLS_CELL';

@Component({
  selector: 'exit-calls-table-cell-renderer',
  styleUrls: ['./exit-calls-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="exit-calls-cell" [htTooltip]="exitCallsTooltip">
      <span class="exit-calls-count">{{ this.apiExitCalls }}</span>

      <ng-template #exitCallsTooltip>
        <ng-container *ngIf="this.apiExitCalls > 0">
          <div *ngFor="let item of this.apiCalleeNameCount | keyvalue" class="api-callee-name-count">
            <span class="api-callee-name">{{ item.key }}</span>
            <span class="api-callee-count">{{ item.value }}</span>
          </div>
          <div
            *ngIf="this.totalCountOfDifferentAPICallee > this.maxShowAPICalleeNameCount"
            class="remaining-api-callee"
          >
            and {{ this.totalCountOfDifferentAPICallee - this.maxShowAPICalleeNameCount }} more
          </div>
        </ng-container>
        <ng-container *ngIf="this.apiExitCalls <= 0" class="no-exit-calls">No exit calls</ng-container>
      </ng-template>
    </div>
  `
})
@TableCellRenderer({
  type: EXIT_CALLS_CELL,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class ExitCallsTableCellRendererComponent extends TableCellRendererBase<ExploreValue, any> implements OnInit {
  public readonly apiCalleeNameCount: any;
  public readonly apiExitCalls: number;
  public readonly maxShowAPICalleeNameCount: number = 10;
  public totalCountOfDifferentAPICallee!: number;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER) parser: TableCellParserBase<ExploreValue, Trace, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: ExploreValue,
    @Inject(TABLE_ROW_DATA) rowData: Trace
  ) {
    super(columnConfig, index, parser, cellData, rowData);
    this.apiCalleeNameCount = this.getMaxShowAPICalleeNameCount(rowData.apiCalleeNameCount);
    this.apiExitCalls = Number(rowData.apiExitCalls);
  }

  public getMaxShowAPICalleeNameCount(apiCalleeNameCount: any): any {
    if (apiCalleeNameCount) {
      const showAPICalleeNameCount: any = {};
      let count = 0;
      Object.keys(apiCalleeNameCount).forEach((key: string) => {
        if (count < this.maxShowAPICalleeNameCount) {
          showAPICalleeNameCount[key] = apiCalleeNameCount[key];
          count++;
        }
      });
      this.totalCountOfDifferentAPICallee = Object.keys(apiCalleeNameCount).length;
      return showAPICalleeNameCount;
    }
    return {};
  }
}
