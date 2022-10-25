import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageHeaderModule } from '@hypertrace/components';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { ApplicationFlowComponent } from './application-flow.component';

@NgModule({
  imports: [CommonModule, ObservabilityDashboardModule, PageHeaderModule],
  declarations: [ApplicationFlowComponent]
})
export class ApplicationFlowModule {}
