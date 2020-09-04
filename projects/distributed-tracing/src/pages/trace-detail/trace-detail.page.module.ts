import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormattingModule, TraceRoute } from '@hypertrace/common';
import { IconModule, LabelModule, LoadAsyncModule, SummaryValueModule } from '@hypertrace/components';
import { TracingDashboardModule } from '../../shared/dashboard/tracing-dashboard.module';
import { TraceDetailPageComponent } from './trace-detail.page.component';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: `:${TraceDetailPageComponent.TRACE_ID_PARAM_NAME}`,
    component: TraceDetailPageComponent
  }
];

@NgModule({
  declarations: [TraceDetailPageComponent],
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    CommonModule,
    LabelModule,
    TracingDashboardModule,
    IconModule,
    SummaryValueModule,
    LoadAsyncModule,
    FormattingModule
  ]
})
export class TraceDetailPageModule {}
