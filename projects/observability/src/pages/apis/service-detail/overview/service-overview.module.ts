import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ServiceOverviewComponent } from './service-overview.component';

@NgModule({
  imports: [CommonModule, ObservabilityDashboardModule],
  declarations: [ServiceOverviewComponent],
  exports: [ServiceOverviewComponent]
})
export class ServiceOverviewModule {}
