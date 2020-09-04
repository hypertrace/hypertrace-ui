import { NgModule } from '@angular/core';
import { SpanDetailWidgetModule } from './span-detail/span-detail-widget.module';
import { TableWidgetModule } from './table/table-widget.module';
import { TraceDetailModule } from './trace-detail/trace-detail-widget.module';
import { WaterfallWidgetModule } from './waterfall/waterfall-widget.module';

@NgModule({
  imports: [SpanDetailWidgetModule, TableWidgetModule, TraceDetailModule, WaterfallWidgetModule]
})
export class TracingDashboardWidgetsModule {}
