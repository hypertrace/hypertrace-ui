import { NgModule } from '@angular/core';
import { PageHeaderModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ApplicationFlowComponent } from './application-flow.component';
import { applicationFlowDefaultJson } from './application-flow.dashboard';

@NgModule({
  imports: [
    ObservabilityDashboardModule,
    PageHeaderModule,
    NavigableDashboardModule.withDefaultDashboards(applicationFlowDefaultJson)
  ],
  declarations: [ApplicationFlowComponent]
})
export class ApplicationFlowModule {}
