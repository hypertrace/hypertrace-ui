import { NgModule } from '@angular/core';
import { PageHeaderModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../shared/dashboard/observability-dashboard.module';
import { EndpointsListComponent } from './endpoints-list.component';
import { endpointsListDashboard } from './endpoints-list.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    PageHeaderModule,
    NavigableDashboardModule.withDefaultDashboards(endpointsListDashboard)
  ],
  declarations: [EndpointsListComponent]
})
export class EndpointsListModule {}
