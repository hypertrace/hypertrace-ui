import { NgModule } from '@angular/core';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ExploreGraphQlQueryHandlerService } from '@hypertrace/observability';
import { ObserveSystemRadarDataSourceModel } from './observe-system-radar-data-source.model';

@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [ObserveSystemRadarDataSourceModel]
    }),
    GraphQlModule.withHandlerProviders([ExploreGraphQlQueryHandlerService])
  ]
})
export class ObserveSystemRadarDataSourceModule {}
