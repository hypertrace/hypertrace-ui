import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ButtonModule,
  FilterBarModule,
  InputModule,
  LetAsyncModule,
  PageHeaderModule,
  SelectModule,
  ToggleGroupModule,
  TraceCheckboxModule
} from '@hypertrace/components';
import { ExploreQueryEditorModule } from '../../../shared/components/explore-query-editor/explore-query-editor.module';
import { NavigableDashboardModule } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { CustomDashboardPanelEditComponent } from './custom-dashboard-panel-edit.component';
@NgModule({
  imports: [
    CommonModule,
    FilterBarModule,
    LetAsyncModule,
    ButtonModule,
    InputModule,
    SelectModule,
    TraceCheckboxModule,
    ToggleGroupModule,
    PageHeaderModule,
    ObservabilityDashboardModule,
    ExploreQueryEditorModule,
    NavigableDashboardModule.withDefaultDashboards()
  ],
  declarations: [CustomDashboardPanelEditComponent]
})
export class CustomDashboardPanelEditModule {}
