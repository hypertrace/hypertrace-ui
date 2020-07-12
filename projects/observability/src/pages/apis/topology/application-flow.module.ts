import { NgModule } from '@angular/core';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ApplicationFlowComponent } from './application-flow.component';

@NgModule({
  imports: [ObservabilityDashboardModule],
  declarations: [ApplicationFlowComponent]
})
export class ApplicationFlowModule {}
