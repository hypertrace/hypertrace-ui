import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ApiOverviewComponent } from './api-overview.component';
import { apiOverviewDashboard } from './api-overview.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    CommonModule,
    LoadAsyncModule,
    NavigableDashboardModule.withDefaultDashboards(apiOverviewDashboard)
  ],
  declarations: [ApiOverviewComponent],
  exports: [ApiOverviewComponent]
})
export class ApiOverviewModule {}
