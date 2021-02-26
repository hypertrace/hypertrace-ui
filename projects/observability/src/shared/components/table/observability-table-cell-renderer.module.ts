import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableModule } from '@hypertrace/components';
import { BackendIconTableCellParser } from './data-cell/backend-icon/backend-icon-table-cell-parser';
import { BackendIconTableCellRendererComponent } from './data-cell/backend-icon/backend-icon-table-cell-renderer.component';
import { BackendIconTableCellRendererModule } from './data-cell/backend-icon/backend-icon-table-cell-renderer.module';
import { EntityTableCellParser } from './data-cell/entity/entity-table-cell-parser';
import { EntityTableCellRendererComponent } from './data-cell/entity/entity-table-cell-renderer.component';
import { EntityTableCellRendererModule } from './data-cell/entity/entity-table-cell-renderer.module';
import { ExploreValueTableCellParser } from './data-cell/explore/explore-table-cell-parser';

@NgModule({
  imports: [
    CommonModule,
    TableModule.withCellParsers([EntityTableCellParser, BackendIconTableCellParser, ExploreValueTableCellParser]),
    TableModule.withCellRenderers([EntityTableCellRendererComponent, BackendIconTableCellRendererComponent]),
    EntityTableCellRendererModule,
    BackendIconTableCellRendererModule
  ]
})
export class ObservabilityTableCellRendererModule {}
