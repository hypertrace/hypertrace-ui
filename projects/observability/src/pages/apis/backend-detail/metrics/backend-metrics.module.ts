import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { FilterBarModule, NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { BackendMetricsComponent } from './backend-metrics.component';
import { backendMetricsDashboard } from './backend-metrics.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    CommonModule,
    FilterBarModule,
    NavigableDashboardModule.withDefaultDashboards(backendMetricsDashboard),
    LoadAsyncModule
  ],
  declarations: [BackendMetricsComponent],
  exports: [BackendMetricsComponent]
})
export class BackendMetricsModule {}
