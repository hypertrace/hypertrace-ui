import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterBarModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/observability';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ServiceApisListComponent } from './service-apis-list.component';
import { serviceApisListDashboard } from './service-apis-list.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    CommonModule,
    FilterBarModule,
    NavigableDashboardModule.withDefaultDashboards(serviceApisListDashboard)
  ],
  declarations: [ServiceApisListComponent],
  exports: [ServiceApisListComponent]
})
export class ServiceApisListModule {}
