import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellAlignmentType, TableCellRenderer, TableCellRendererBase } from '@hypertrace/components';
import { ObservabilityTableCellType } from '../../observability-table-cell-type';
import { MaybeInactiveEntity } from './entity-table-cell-parser';

@Component({
  selector: 'ht-entity-table-cell-renderer',
  styleUrls: ['./entity-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fill-container entity-cell" [ngClass]="{ 'first-column': this.isFirstColumn }">
      <ht-entity-renderer
        [entity]="this.value"
        [inactive]="this.value?.isInactive === true"
        [navigable]="true"
      ></ht-entity-renderer>
    </div>
  `
})
@TableCellRenderer({
  type: ObservabilityTableCellType.Entity,
  alignment: TableCellAlignmentType.Left,
  parser: ObservabilityTableCellType.Entity
})
export class EntityTableCellRendererComponent extends TableCellRendererBase<MaybeInactiveEntity | undefined> {}
