import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HtRoute } from '@hypertrace/common';
import { NavigableDashboardModule } from '../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { TracingDashboardModule } from '../../shared/dashboard/tracing-dashboard.module';
import { SpanListPageComponent } from './span-list.page.component';
import { spanListDashboard } from './span-list.page.dashboard';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: SpanListPageComponent
  }
];

@NgModule({
  imports: [
    TracingDashboardModule,
    CommonModule,
    NavigableDashboardModule.withDefaultDashboards(spanListDashboard),
    RouterModule.forChild(ROUTE_CONFIG)
  ],
  declarations: [SpanListPageComponent]
})
export class SpanListPageModule {}
