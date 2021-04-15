import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule, TableModule, TooltipModule } from '@hypertrace/components';
import { BackendIconTableCellParser } from './data-cell/backend-icon/backend-icon-table-cell-parser';
import { BackendIconTableCellRendererComponent } from './data-cell/backend-icon/backend-icon-table-cell-renderer.component';
import { BackendIconTableCellRendererModule } from './data-cell/backend-icon/backend-icon-table-cell-renderer.module';
import { EndpointTableCellRendererComponent } from './data-cell/endpoint/endpoint-table-cell-renderer.component';
import { EntityTableCellParser } from './data-cell/entity/entity-table-cell-parser';
import { EntityTableCellRendererComponent } from './data-cell/entity/entity-table-cell-renderer.component';
import { EntityTableCellRendererModule } from './data-cell/entity/entity-table-cell-renderer.module';
import { ExitCallsTableCellRendererComponent } from './data-cell/exit-calls/exit-calls-table-cell-renderer.component';

@NgModule({
  imports: [
    CommonModule,
    TableModule.withCellParsers([EntityTableCellParser, BackendIconTableCellParser]),
    TableModule.withCellRenderers([
      EntityTableCellRendererComponent,
      BackendIconTableCellRendererComponent,
      ExitCallsTableCellRendererComponent,
      EndpointTableCellRendererComponent
    ]),
    EntityTableCellRendererModule,
    BackendIconTableCellRendererModule,
    TooltipModule,
    IconModule
  ],
  declarations: [ExitCallsTableCellRendererComponent, EndpointTableCellRendererComponent],
  exports: [ExitCallsTableCellRendererComponent, EndpointTableCellRendererComponent]
})
export class ObservabilityTableCellRendererModule {}
