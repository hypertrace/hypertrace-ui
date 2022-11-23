import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ServiceDependencyGraphComponent } from './service-dependency-graph.component';
import { serviceDependencyGraphDashboard } from './service-dependency-graph.dashboard';

@NgModule({
  imports: [
    CommonModule,
    ObservabilityDashboardModule,
    LoadAsyncModule,
    NavigableDashboardModule.withDefaultDashboards(serviceDependencyGraphDashboard)
  ],
  declarations: [ServiceDependencyGraphComponent],
  exports: [ServiceDependencyGraphComponent]
})
export class ServiceDependencyGraphModule {}
