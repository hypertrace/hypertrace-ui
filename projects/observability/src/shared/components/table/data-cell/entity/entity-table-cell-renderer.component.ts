import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TableCellAlignmentType,
  TableCellRenderer,
  TableCellRendererComponent,
  TableRow
} from '@hypertrace/components';
import { Entity } from '../../../../graphql/model/schema/entity';
import { ObservabilityTableCellRenderer } from '../../observability-table-cell-renderer';
import { parseEntityFromTableRow } from './entity-table-cell-renderer-util';

@Component({
  selector: 'ht-entity-table-cell-renderer',
  styleUrls: ['./entity-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fill-container entity-cell" [ngClass]="{ 'first-column': this.isFirstColumn }">
      <ht-entity-renderer [entity]="this.value" [navigable]="true"></ht-entity-renderer>
    </div>
  `
})
@TableCellRenderer({
  type: ObservabilityTableCellRenderer.Entity,
  alignment: TableCellAlignmentType.Left
})
export class EntityTableCellRendererComponent extends TableCellRendererComponent<Entity | undefined> {
  public parseValue(cellData: Entity | undefined, row: TableRow): Entity | undefined {
    return parseEntityFromTableRow(cellData, row);
  }
}
