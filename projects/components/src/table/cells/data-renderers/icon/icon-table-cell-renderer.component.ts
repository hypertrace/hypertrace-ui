import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IconSize } from '../../../../icon/icon-size';
import { IconData } from '../../data-parsers/table-cell-icon-parser';
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
        [size]="this.iconSize"
        [showTooltip]="true"
        [ngClass]="this.value.color"
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

  public ngOnInit(): void {
    super.ngOnInit();

    this.iconSize = this.value?.size ?? IconSize.Small;
  }
}

type CellData = string | IconData | undefined;
type Value = IconData | undefined;
