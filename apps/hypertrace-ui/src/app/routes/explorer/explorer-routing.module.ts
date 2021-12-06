import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HtRoute } from '@hypertrace/common';
import { FilterBuilderLookupService } from '@hypertrace/components';
import {
  ExplorerComponent,
  ExplorerDashboardBuilder,
  ExplorerModule,
  MetadataService
} from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: ExplorerComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    ExplorerModule.withDashboardBuilderFactory({
      useFactory: (metadataService: MetadataService, filterBuilderLookupService: FilterBuilderLookupService) =>
        new ExplorerDashboardBuilder(metadataService, filterBuilderLookupService),
      deps: [MetadataService, FilterBuilderLookupService]
    })
  ]
})
export class ExplorerRoutingModule {}
