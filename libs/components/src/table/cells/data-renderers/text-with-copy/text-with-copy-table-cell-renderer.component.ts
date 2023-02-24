import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonSize } from '../../../../button/button';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-text-table-with-copy-cell-renderer',
  styleUrls: ['./text-with-copy-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="{ clickable: this.clickable, 'first-column': this.isFirstColumn }"
      class="text-with-copy-action-cell"
    >
      <span class="text" [htTooltip]="this.value">{{ this.value | htDisplayString }}</span>

      <div class="copy-button" *ngIf="this.value !== ''">
        <ht-copy-to-clipboard size="${ButtonSize.ExtraSmall}" label="" [text]="this.value"></ht-copy-to-clipboard>
      </div>
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.TextWithCopyAction,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.String
})
export class TextWithCopyActionTableCellRendererComponent extends TableCellRendererBase<string> {}
