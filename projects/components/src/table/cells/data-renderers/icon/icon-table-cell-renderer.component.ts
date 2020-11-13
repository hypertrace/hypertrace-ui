import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { IconSize } from '../../../../icon/icon-size';
import { TableColumnConfig, TableRow } from '../../../table-api';
import { IconData } from '../../data-parsers/table-cell-icon-parser';
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
  selector: 'ht-icon-table-cell-renderer',
  styleUrls: ['./icon-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icon-cell" [ngClass]="{ clickable: this.clickable }" *ngIf="this.value">
      <ht-icon
        [icon]="this.value.icon"
        [label]="this.value.label"
        [size]="this.iconSize"
        [showTooltip]="true"
        [style.color]="this.value.color"
      ></ht-icon>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Icon,
  alignment: TableCellAlignmentType.Center,
  parser: CoreTableCellParserType.Icon
})
export class IconTableCellRendererComponent extends TableCellRendererBase<CellData, Value> implements OnInit {
  public iconSize: IconSize = IconSize.Small;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_DATA_PARSER) parser: TableCellParserBase<CellData, Value, unknown>,
    @Inject(TABLE_CELL_DATA) cellData: CellData,
    @Inject(TABLE_ROW_DATA) rowData: TableRow
  ) {
    super(columnConfig, index, parser, cellData, rowData);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.iconSize = this.value?.size ?? IconSize.Small;
  }
}

type CellData = string | IconData | undefined;
type Value = IconData | undefined;
