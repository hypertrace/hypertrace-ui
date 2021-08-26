import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/observability';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ApiTraceListComponent } from './api-trace-list.component';
import { apiTraceListDashboard } from './api-trace-list.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    CommonModule,
    LoadAsyncModule,
    NavigableDashboardModule.withDefaultDashboards(apiTraceListDashboard)
  ],
  declarations: [ApiTraceListComponent],
  exports: [ApiTraceListComponent]
})
export class ApiTraceListModule {}
