import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TimeDuration, TimeUnit, UnitStringType } from '@hypertrace/common';
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
      <span class="duration-text" [htTooltip]="this.getDurationString | htMemoize: this.value" >{{ this.getDurationString | htMemoize: this.value }}</span>
    </div>
  `,
  styleUrls: ['./duration-table-cell-renderer.component.scss']
})

@TableCellRenderer({
  type: CoreTableCellRendererType.Duration,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class DurationTableCellRendererComponent extends TableCellRendererBase<TimeDuration> implements OnInit{
  public getDurationString(timeDuration : TimeDuration): string {
    return timeDuration.toMultiUnitString(TimeUnit.Second, true, UnitStringType.Long)
  }
}