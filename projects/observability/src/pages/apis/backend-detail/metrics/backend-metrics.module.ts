import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { BackendMetricsComponent } from './backend-metrics.component';
import { backendMetricsDashboard } from './backend-metrics.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    CommonModule,
    LoadAsyncModule,
    NavigableDashboardModule.withDefaultDashboards(backendMetricsDashboard)
  ],
  declarations: [BackendMetricsComponent],
  exports: [BackendMetricsComponent]
})
export class BackendMetricsModule {}
