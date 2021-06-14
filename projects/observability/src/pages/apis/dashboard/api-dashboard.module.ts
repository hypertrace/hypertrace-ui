import { NgModule } from '@angular/core';
import { PageHeaderModule } from '@hypertrace/components';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ApiDashboardComponent } from './api-dashboard.component';

@NgModule({
  imports: [ObservabilityDashboardModule, PageHeaderModule],
  declarations: [ApiDashboardComponent]
})
export class ApiDashboardModule {}
