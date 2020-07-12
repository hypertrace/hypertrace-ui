import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraceRoute } from '@hypertrace/common';
import { PanelModule, ToggleButtonModule } from '@hypertrace/components';
import { FilterBarModule } from '@hypertrace/distributed-tracing';
import { ExploreQueryEditorModule } from '../../shared/components/explore-query-editor/explore-query-editor.module';
import { ObservabilityDashboardModule } from '../../shared/dashboard/observability-dashboard.module';
import { ExplorerComponent } from './explorer.component';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    component: ExplorerComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    CommonModule,
    ObservabilityDashboardModule,
    FilterBarModule,
    ExploreQueryEditorModule,
    PanelModule,
    ToggleButtonModule
  ],
  declarations: [ExplorerComponent]
})
export class ExplorerModule {}
