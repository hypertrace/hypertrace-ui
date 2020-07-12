import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableModule } from '@hypertrace/components';
import { BackendIconTableCellRendererComponent } from './data-cell/backend-icon/backend-icon-table-cell-renderer.component';
import { BackendIconTableCellRendererModule } from './data-cell/backend-icon/backend-icon-table-cell-renderer.module';
import { EntityTableCellRendererComponent } from './data-cell/entity/entity-table-cell-renderer.component';
import { EntityTableCellRendererModule } from './data-cell/entity/entity-table-cell-renderer.module';

@NgModule({
  imports: [
    CommonModule,
    TableModule.withCellRenderers([EntityTableCellRendererComponent, BackendIconTableCellRendererComponent]),
    EntityTableCellRendererModule,
    BackendIconTableCellRendererModule
  ]
})
export class ObservabilityTableCellRendererModule {}
