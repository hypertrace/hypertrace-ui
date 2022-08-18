import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ButtonModule,
  CopyToClipboardModule,
  FilterBarModule,
  InputModule,
  LetAsyncModule,
  LoadAsyncModule,
  MessageDisplayModule,
  NotificationModule,
  PageHeaderModule
} from '@hypertrace/components';
import { NavigableDashboardModule } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { CustomDashboardPanelModule } from '../custom-dashboard-panel/custom-dashboard-panel.module';
import { CustomDashboardDetailComponent } from './custom-dashboard-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FilterBarModule,
    ButtonModule,
    InputModule,
    LetAsyncModule,
    LoadAsyncModule,
    PageHeaderModule,
    MessageDisplayModule,
    CustomDashboardPanelModule,
    CopyToClipboardModule,
    NotificationModule,
    ObservabilityDashboardModule,
    NavigableDashboardModule.withDefaultDashboards()
  ],
  declarations: [CustomDashboardDetailComponent]
})
export class CustomDashboardDetailModule {}
