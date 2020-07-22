import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraceRoute } from '@hypertrace/common';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { ExplorerComponent, ExplorerDashboardBuilder, ExplorerModule } from '@hypertrace/observability';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    component: ExplorerComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    ExplorerModule.withDashboardBuilderFactory({
      useFactory: (metadataService: MetadataService) => new ExplorerDashboardBuilder(metadataService),
      deps: [MetadataService]
    })
  ]
})
export class ExplorerRoutingModule {}
