import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ServiceOverviewComponent } from './service-overview.component';
import { serviceOverviewDashboard } from './service-overview.dashboard';

@NgModule({
  imports: [
    CommonModule,
    ObservabilityDashboardModule,
    LoadAsyncModule,
    NavigableDashboardModule.withDefaultDashboards(serviceOverviewDashboard)
  ],
  declarations: [ServiceOverviewComponent],
  exports: [ServiceOverviewComponent]
})
export class ServiceOverviewModule {}
