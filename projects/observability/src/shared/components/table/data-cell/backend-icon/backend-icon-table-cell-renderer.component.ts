import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  IconSize,
  TableCellAlignmentType,
  TableCellRenderer,
  TableCellRendererComponent,
  TableColumnConfig,
  TableRow,
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from '@hypertrace/components';
import { EntityIconLookupService } from '../../../../services/entity/entity-icon-lookup.service';
import { ObservabilityTableCellRenderer } from '../../observability-table-cell-renderer';
@Component({
  selector: 'ht-backend-icon-table-cell-renderer',
  styleUrls: ['./backend-icon-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icon-cell" [ngClass]="{ clickable: this.clickable }">
      <htc-icon class="icon" [icon]="this.value" size="${IconSize.Medium}" [showTooltip]="true"></htc-icon>
    </div>
  `
})
@TableCellRenderer({
  type: ObservabilityTableCellRenderer.BackendIcon,
  alignment: TableCellAlignmentType.Center
})
export class BackendIconTableCellRendererComponent extends TableCellRendererComponent<string> {
  public constructor(
    private readonly lookupService: EntityIconLookupService,
    @Inject(TABLE_CELL_RENDERER_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_CELL_RENDERER_COLUMN_INDEX) index: number,
    @Inject(TABLE_CELL_RENDERER_ROW_DATA) rowData: TableRow,
    @Inject(TABLE_CELL_RENDERER_CELL_DATA) cellData: string
  ) {
    super(columnConfig, index, rowData, cellData);
  }

  public parseValue(cellData: string): string {
    return this.lookupService.forBackendType(cellData);
  }
}
