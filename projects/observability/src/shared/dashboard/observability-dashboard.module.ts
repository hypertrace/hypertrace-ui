import { NgModule } from '@angular/core';
import { TracingDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityIconLibraryModule } from '../icons/observability-icon-library.module';
import { ObservabilityGraphQlDataSourceModule } from './data/graphql/observability-graphql-data-source.module';
import { ObservabilityDashboardInteractionsModule } from './interactions/observability-dashboard-interactions.module';
import { ObservabilityDashboardWidgetsModule } from './widgets/observability-dashboard-widgets.module';

@NgModule({
  imports: [
    TracingDashboardModule,
    ObservabilityDashboardWidgetsModule,
    ObservabilityGraphQlDataSourceModule,
    ObservabilityIconLibraryModule,
    ObservabilityDashboardInteractionsModule
  ],
  exports: [TracingDashboardModule]
})
export class ObservabilityDashboardModule {}
