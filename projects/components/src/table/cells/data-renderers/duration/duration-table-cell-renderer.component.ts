import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { UnitStringType } from '@hypertrace/common';
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
  selector: 'ht-duration-table-cell-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="duration-cell">
      <span class="duration-text">{{ this.value | htDisplayDuration: this.formatter }}</span>
    </div>
  `,
  styleUrls: ['./duration-table-cell-renderer.component.scss']
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Duration,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class DurationTableCellRendererComponent extends TableCellRendererBase<number> {
  public readonly formatter: UnitStringType = UnitStringType.Long;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER) parser: TableCellParserBase<number, number, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: number,
    @Inject(TABLE_ROW_DATA) rowData: TableRow
  ) {
    super(columnConfig, index, parser, cellData, rowData);
  }
}
