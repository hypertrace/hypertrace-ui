import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { FilterBarModule, NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { apiMetricsDashboard } from './api-metrics-dashboard';
import { ApiMetricsComponent } from './api-metrics.component';

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
