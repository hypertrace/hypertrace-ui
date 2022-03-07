import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-string-array-with-x-more-table-cell-renderer',
  styleUrls: ['./string-array-with-x-more-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="string-array-cell" *ngIf="this.value.items.length>0; else empty">
      <div class="item" *ngFor="let item of this.value.items | slice: 0:this.value.maxToShow">
        {{ item }}
      </div>
      <ht-x-more
        class="rem-items"
        [count]="this.value.items.length - this.value.maxToShow"
        [tooltip]="summaryTooltip"
      ></ht-x-more>
      <ng-template #summaryTooltip>
        <div class="tooltip-container">
          <div
            class="tooltip-item"
            *ngFor="let item of this.value.items | slice: this.value.maxToShow:this.value.items.length"
          >
            {{ item }}
          </div>
        </div>
      </ng-template>
    </div>
    <ng-template #empty>
      <span class='empty-cell'>-</span>
    </ng-template>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.StringArrayWithXMore,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class StringArrayWithXMoreTableCellRendererComponent extends TableCellRendererBase<StringArrayWithXMore> implements OnInit {}

export interface StringArrayWithXMore{
  items: string[];
  maxToShow: number;
}