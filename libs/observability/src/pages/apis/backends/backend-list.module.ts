import { NgModule } from '@angular/core';
import { PageHeaderModule } from '@hypertrace/components';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { BackendListComponent } from './backend-list.component';

@NgModule({
  imports: [ObservabilityDashboardModule, PageHeaderModule],
  declarations: [BackendListComponent]
})
export class BackendListModule {}
