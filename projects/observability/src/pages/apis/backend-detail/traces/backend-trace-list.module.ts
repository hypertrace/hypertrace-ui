import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { BackendTraceListComponent } from './backend-trace-list.component';
import { backendTraceListDashboard } from './backend-trace-list.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    CommonModule,
    LoadAsyncModule,
    NavigableDashboardModule.withDefaultDashboards(backendTraceListDashboard)
  ],
  declarations: [BackendTraceListComponent],
  exports: [BackendTraceListComponent]
})
export class BackendTraceListModule {}
