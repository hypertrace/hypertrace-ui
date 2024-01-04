import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormattingModule, HtRoute, MemoizeModule } from '@hypertrace/common';
import {
  ButtonModule,
  CopyShareableLinkToClipboardModule,
  IconModule,
  LabelModule,
  LoadAsyncModule,
  NavigableTabModule,
  SummaryValueModule,
  TooltipModule,
} from '@hypertrace/components';
import { ExploreFilterLinkModule } from '../../shared/components/explore-filter-link/explore-filter-link.module';
import { LogEventsTableModule } from '../../shared/components/log-events/log-events-table.module';
import { NavigableDashboardModule } from '../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityDashboardModule } from '../../shared/dashboard/observability-dashboard.module';
import { ApiTraceDetailPageComponent } from './api-trace-detail.page.component';
import { ApiTraceLogsComponent } from './logs/api-trace-logs.component';
import { ApiTraceSequenceComponent } from './sequence/api-trace-sequence.component';
import { apiTraceSequenceDashboard } from './sequence/api-trace-sequence.dashboard';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: `:${ApiTraceDetailPageComponent.TRACE_ID_PARAM_NAME}`,
    component: ApiTraceDetailPageComponent,
    children: [
      {
        path: '',
        redirectTo: 'sequence',
        pathMatch: 'full',
      },
      {
        path: 'sequence',
        component: ApiTraceSequenceComponent,
      },
      {
        path: 'logs',
        component: ApiTraceLogsComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [ApiTraceDetailPageComponent, ApiTraceSequenceComponent, ApiTraceLogsComponent],
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    CommonModule,
    LabelModule,
    ObservabilityDashboardModule,
    IconModule,
    SummaryValueModule,
    LoadAsyncModule,
    MemoizeModule,
    FormattingModule,
    ButtonModule,
    TooltipModule,
    ExploreFilterLinkModule,
    CopyShareableLinkToClipboardModule,
    NavigableTabModule,
    LogEventsTableModule,
    NavigableDashboardModule.withDefaultDashboards(apiTraceSequenceDashboard),
  ],
})
export class ApiTraceDetailPageModule {}
