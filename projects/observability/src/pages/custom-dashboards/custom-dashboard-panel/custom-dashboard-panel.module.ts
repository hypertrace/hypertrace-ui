import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule, PanelModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { CustomDashboardPanelComponent } from './custom-dashboard-panel.component';

@NgModule({
  imports: [
    CommonModule,
    ObservabilityDashboardModule,
    PanelModule,
    IconModule,
    NavigableDashboardModule.withDefaultDashboards()
  ],
  declarations: [CustomDashboardPanelComponent],
  exports: [CustomDashboardPanelComponent]
})
export class CustomDashboardPanelModule {}
