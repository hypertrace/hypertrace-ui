import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormattingModule, TraceRoute } from '@hypertrace/common';
import {
  ButtonModule,
  CopyShareableLinkToClipboardModule,
  DownloadJsonModule,
  IconModule,
  LabelModule,
  LoadAsyncModule,
  SummaryValueModule
} from '@hypertrace/components';
import { ObservabilityDashboardModule } from '../../shared/dashboard/observability-dashboard.module';
import { ApiTraceDetailPageComponent } from './api-trace-detail.page.component';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: `:${ApiTraceDetailPageComponent.TRACE_ID_PARAM_NAME}`,
    component: ApiTraceDetailPageComponent
  }
];

@NgModule({
  declarations: [ApiTraceDetailPageComponent],
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    CommonModule,
    LabelModule,
    ObservabilityDashboardModule,
    IconModule,
    SummaryValueModule,
    LoadAsyncModule,
    FormattingModule,
    ButtonModule,
    CopyShareableLinkToClipboardModule,
    DownloadJsonModule
  ]
})
export class ApiTraceDetailPageModule {}
