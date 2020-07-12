import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { BackendOverviewComponent } from './backend-overview.component';

@NgModule({
  imports: [ObservabilityDashboardModule, CommonModule],
  declarations: [BackendOverviewComponent],
  exports: [BackendOverviewComponent]
})
export class BackendOverviewModule {}
