import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TableModule } from '@hypertrace/components';
import { NavigableDashboardModule } from '../../../dashboard/dashboard-wrapper/navigable-dashboard.module';
import { SpanLogEventsComponent } from './span-log-events.component';
import { spanLogEventsDashboard } from './span-log-events.dashboard';

@NgModule({
  imports: [
    CommonModule,
    FormattingModule,
    TableModule,
    NavigableDashboardModule.withDefaultDashboards(spanLogEventsDashboard)
  ],
  declarations: [SpanLogEventsComponent],
  exports: [SpanLogEventsComponent]
})
export class SpanLogEventsModule {}
