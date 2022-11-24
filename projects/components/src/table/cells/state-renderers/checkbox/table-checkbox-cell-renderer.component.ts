import { ChangeDetectionStrategy, Component, Inject, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatefulTableRow, TableColumnConfig, TableRow, TableRowState } from '../../../table-api';
import {
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_DATA_PARSER,
  TABLE_ROW_DATA,
  TABLE_ROW_DATA_STREAM
} from '../../table-cell-injection';
import { TableCellParserBase } from '../../table-cell-parser-base';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-table-checkbox-cell-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row-checkbox-cell">
      <ht-checkbox [checked]="this.checked$ | async"></ht-checkbox>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Checkbox,
  alignment: TableCellAlignmentType.Center,
  parser: CoreTableCellParserType.State
})
export class TableCheckboxCellRendererComponent extends TableCellRendererBase<TableRowState> {
  public readonly checked$: Observable<boolean>;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER) parser: TableCellParserBase<TableRowState, TableRowState, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: TableRowState,
    @Inject(TABLE_ROW_DATA) rowData: TableRow,
    @Optional()
    @Inject(TABLE_ROW_DATA_STREAM)
    private readonly streamingRowData?: Observable<StatefulTableRow>
  ) {
    super(columnConfig, index, parser, cellData, rowData);
    this.checked$ = this.streamingRowData
      ? this.streamingRowData.pipe(map(data => data?.$$state?.selected ?? this.value.selected))
      : of(this.value.selected);
  }
}
