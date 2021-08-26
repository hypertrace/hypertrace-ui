import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterBarModule, LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/observability';
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
