import { NgModule } from '@angular/core';
import { PageHeaderModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ServiceListComponent } from './service-list.component';
import { servicesListDashboard } from './services-list-dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    PageHeaderModule,
    NavigableDashboardModule.withDefaultDashboards(servicesListDashboard)
  ],
  declarations: [ServiceListComponent]
})
export class ServiceListModule {}
