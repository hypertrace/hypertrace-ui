import { NgModule } from '@angular/core';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { BackendListComponent } from './backend-list.component';

@NgModule({
  imports: [ObservabilityDashboardModule],
  declarations: [BackendListComponent]
})
export class BackendListModule {}
