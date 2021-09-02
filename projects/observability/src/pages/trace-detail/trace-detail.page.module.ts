import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormattingModule, HtRoute, MemoizeModule } from '@hypertrace/common';
import {
  CopyShareableLinkToClipboardModule,
  DownloadJsonModule,
  IconModule,
  LabelModule,
  LinkModule,
  LoadAsyncModule,
  NavigableTabModule,
  SummaryValueModule,
  TooltipModule
} from '@hypertrace/components';
import { ExploreFilterLinkModule } from '../../shared/components/explore-filter-link/explore-filter-link.module';
import { LogEventsTableModule } from '../../shared/components/log-events/log-events-table.module';
import { NavigableDashboardModule } from '../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { TracingDashboardModule } from '../../shared/dashboard/tracing-dashboard.module';
import { TraceLogsComponent } from './logs/trace-logs.component';
import { TraceSequenceComponent } from './sequence/trace-sequence.component';
import { traceSequenceDashboard } from './sequence/trace-sequence.dashboard';
import { TraceDetailPageComponent } from './trace-detail.page.component';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: `:${TraceDetailPageComponent.TRACE_ID_PARAM_NAME}`,
    component: TraceDetailPageComponent,
    children: [
      {
        path: '',
        redirectTo: 'sequence',
        pathMatch: 'full'
      },
      {
        path: 'sequence',
        component: TraceSequenceComponent
      },
      {
        path: 'logs',
        component: TraceLogsComponent
      }
    ]
  }
];

@NgModule({
  declarations: [TraceDetailPageComponent, TraceSequenceComponent, TraceLogsComponent],
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    CommonModule,
    ExploreFilterLinkModule,
    LabelModule,
    TracingDashboardModule,
    IconModule,
    SummaryValueModule,
    LinkModule,
    MemoizeModule,
    TooltipModule,
    LoadAsyncModule,
    FormattingModule,
    CopyShareableLinkToClipboardModule,
    DownloadJsonModule,
    NavigableDashboardModule.withDefaultDashboards(traceSequenceDashboard),
    NavigableTabModule,
    LogEventsTableModule
  ]
})
export class TraceDetailPageModule {}
