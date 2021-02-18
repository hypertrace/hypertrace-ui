import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterBarModule, LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ApiMetricsComponent } from './api-metrics.component';
import { apiMetricsDashboard } from './api-metrics.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    CommonModule,
    FilterBarModule,
    NavigableDashboardModule.withDefaultDashboards(apiMetricsDashboard),
    LoadAsyncModule
  ],
  declarations: [ApiMetricsComponent],
  exports: [ApiMetricsComponent]
})
export class ApiMetricsModule {}
