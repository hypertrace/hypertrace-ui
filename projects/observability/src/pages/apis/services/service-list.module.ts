import { NgModule } from '@angular/core';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ServiceListComponent } from './service-list.component';

@NgModule({
  imports: [ObservabilityDashboardModule],
  declarations: [ServiceListComponent]
})
export class ServiceListModule {}
