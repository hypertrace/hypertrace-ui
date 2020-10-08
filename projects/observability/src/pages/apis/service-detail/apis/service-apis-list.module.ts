import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterBarModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { serviceApisListDashboard } from './service-apis-list-dashboard';
import { ServiceApisListComponent } from './service-apis-list.component';

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
