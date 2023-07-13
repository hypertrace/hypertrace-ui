import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { displayString } from '@hypertrace/common';
import { TableColumnConfig } from '../../../table-api';
import { TABLE_COLUMN_CONFIG } from '../../table-cell-injection';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-text-table-cell-renderer',
  styleUrls: ['./text-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="{ clickable: this.clickable, 'first-column': this.isFirstColumn }"
      class="text-cell"
      [htTooltip]="this.value"
    >
      {{ this.format | htMemoize: this.value }}
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Text,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.String
})
export class TextTableCellRendererComponent extends TableCellRendererBase<string> {
  private readonly columnConfigData: TableColumnConfig<TextTableCellRendererOption> = inject<
    TableColumnConfig<TextTableCellRendererOption>
  >(TABLE_COLUMN_CONFIG);

  public format = (value: string): string => {
    const formatted = this.columnConfigData.options?.formatter?.(value) ?? value;

    return displayString(formatted, '-');
  };
}

export interface TextTableCellRendererOption {
  formatter?: (value: string) => string;
}
