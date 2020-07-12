import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { FilterBarModule, NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ServiceMetricsComponent } from './service-metrics.component';
import { serviceMetricsDashboard } from './service-metrics.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    CommonModule,
    FilterBarModule,
    NavigableDashboardModule.withDefaultDashboards(serviceMetricsDashboard),
    LoadAsyncModule
  ],
  declarations: [ServiceMetricsComponent],
  exports: [ServiceMetricsComponent]
})
export class ServiceMetricsModule {}
