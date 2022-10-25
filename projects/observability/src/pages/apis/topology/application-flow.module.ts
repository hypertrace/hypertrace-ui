import { NgModule } from '@angular/core';
import { LetAsyncModule, PageHeaderModule } from '@hypertrace/components';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ApplicationFlowComponent } from './application-flow.component';

@NgModule({
  imports: [ObservabilityDashboardModule, PageHeaderModule, LetAsyncModule],
  declarations: [ApplicationFlowComponent]
})
export class ApplicationFlowModule {}
