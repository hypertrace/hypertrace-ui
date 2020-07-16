import { NgModule } from '@angular/core';
import { PageHeaderModule } from '@hypertrace/components';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ServiceListComponent } from './service-list.component';

@NgModule({
  imports: [ObservabilityDashboardModule, PageHeaderModule],
  declarations: [ServiceListComponent]
})
export class ServiceListModule {}
