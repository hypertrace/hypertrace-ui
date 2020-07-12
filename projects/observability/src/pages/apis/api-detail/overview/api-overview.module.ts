import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ApiOverviewComponent } from './api-overview.component';

@NgModule({
  imports: [ObservabilityDashboardModule, CommonModule],
  declarations: [ApiOverviewComponent],
  exports: [ApiOverviewComponent]
})
export class ApiOverviewModule {}
