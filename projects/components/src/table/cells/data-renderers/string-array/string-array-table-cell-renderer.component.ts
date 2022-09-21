import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { XMoreDisplay } from '../../../../x-more/x-more.component';
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
    <div class="string-array-cell" [htTooltip]="this.value?.length > 0 ? summaryTooltip : undefined">
      <ng-container *ngIf="this.value?.length > 0; else emptyValueTemplate">
        <span class="first-item">{{ this.value[0] | htDisplayString }}</span>
        <ht-x-more [count]="(this.value | slice: 1).length" displayStyle="${XMoreDisplay.Gray}"></ht-x-more>
      </ng-container>

      <ng-template #summaryTooltip>
        <div *ngFor="let value of this.value">{{ value }}</div>
      </ng-template>

      <ng-template #emptyValueTemplate>-</ng-template>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.StringArray,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class StringArrayTableCellRendererComponent extends TableCellRendererBase<string[]> implements OnInit {}
