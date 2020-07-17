import { ChangeDetectionStrategy, Component, Inject, Optional } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import {
  IconSize,
  TableCellAlignmentType,
  TableCellRenderer,
  TableCellRendererComponent,
  TableColumnConfig,
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
    @Optional() @Inject(TABLE_CELL_RENDERER_CELL_DATA) cellData: string | null,
    @Optional() @Inject(TABLE_CELL_RENDERER_ROW_DATA) rowData: Dictionary<unknown> | null
  ) {
    super(columnConfig, index, cellData, rowData);
  }

  protected parseValue(raw: string): string {
    return this.lookupService.forBackendType(raw);
  }
}
