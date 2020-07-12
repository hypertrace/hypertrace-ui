import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterBarModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '../../../../shared/dashboard/observability-dashboard.module';
import { ServiceApisListComponent } from './service-apis-list.component';

@NgModule({
  imports: [ObservabilityDashboardModule, CommonModule, FilterBarModule],
  declarations: [ServiceApisListComponent],
  exports: [ServiceApisListComponent]
})
export class ServiceApisListModule {}
