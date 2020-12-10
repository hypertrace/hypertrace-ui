import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule, SummaryValueModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { SpanDetailModule } from '../../../components/span-detail/span-detail.module';
import { ApiTraceDetailDataSourceModel } from './data/api-trace-detail-data-source.model';
import { TraceDetailWidgetRendererComponent } from './trace-detail-widget-renderer.component';
import { TraceDetailWidgetModel } from './trace-detail-widget.model';

@NgModule({
  declarations: [TraceDetailWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [TraceDetailWidgetModel, ApiTraceDetailDataSourceModel],
      renderers: [TraceDetailWidgetRendererComponent]
    }),
    CommonModule,
    SpanDetailModule,
    TitledContentModule,
    LoadAsyncModule,
    SummaryValueModule
  ]
})
export class TraceDetailModule {}
