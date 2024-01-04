import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ServiceTraceListComponent } from './service-trace-list.component';
import { serviceTraceListDashboard } from './service-trace-list.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    LoadAsyncModule,
    NavigableDashboardModule.withDefaultDashboards(serviceTraceListDashboard),
  ],
  declarations: [ServiceTraceListComponent],
  exports: [ServiceTraceListComponent],
})
export class ServiceTraceListModule {}
