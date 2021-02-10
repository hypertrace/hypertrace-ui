import { NgModule } from '@angular/core';
import { PageHeaderModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ServiceListComponent } from './service-list.component';
import { serviceListDashboard } from './service-list.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    PageHeaderModule,
    NavigableDashboardModule.withDefaultDashboards(serviceListDashboard)
  ],
  declarations: [ServiceListComponent]
})
export class ServiceListModule {}
