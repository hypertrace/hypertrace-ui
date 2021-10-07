import { NgModule } from '@angular/core';
import { DashboardModule } from '@hypertrace/dashboards';
import { TracingIconLibraryModule } from '../icons/tracing-icon-library.module';
import { NavigableDashboardModule } from './dashboard-wrapper/navigable-dashboard.module';
import { GraphQlDataSourceModule } from './data/graphql/graphql-data-source.module';
import { TracingDashboardInteractionsModule } from './interaction/tracing-dashboard-interactions.module';
import { TracingDashboardPropertyEditorsModule } from './properties/tracing-dashboard-properties.module';
import { TracingDashboardWidgetsModule } from './widgets/tracing-dashboard-widgets.module';

@NgModule({
  imports: [
    NavigableDashboardModule,
    DashboardModule,
    TracingDashboardWidgetsModule,
    GraphQlDataSourceModule,
    TracingDashboardPropertyEditorsModule,
    TracingIconLibraryModule,
    TracingDashboardInteractionsModule
  ],
  exports: [NavigableDashboardModule]
})
export class TracingDashboardModule {}
