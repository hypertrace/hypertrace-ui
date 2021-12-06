import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { TableColumnConfig, TableRow } from '../../../table-api';
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

@Component({
  selector: 'ht-string-array-table-cell-renderer',
  styleUrls: ['./string-array-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="string-array-cell" [htTooltip]="summaryTooltip">
      <span class="first-item">{{ this.firstItem | htDisplayString }}</span>
      <span class="summary-text">{{ this.summaryText }}</span>

      <ng-template #summaryTooltip>
        <div *ngFor="let value of this.value">{{ value }}</div>
      </ng-template>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.StringArray,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class StringArrayTableCellRendererComponent extends TableCellRendererBase<string[]> implements OnInit {
  public firstItem!: string;
  public summaryText!: string;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER) parser: TableCellParserBase<string[], string[], unknown>,
    @Inject(TABLE_CELL_DATA) cellData: string[],
    @Inject(TABLE_ROW_DATA) rowData: TableRow
  ) {
    super(columnConfig, index, parser, cellData, rowData);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.firstItem = this.value[0];
    this.summaryText = this.value.length > 1 ? `+${this.value.length - 1}` : '';
  }
}
