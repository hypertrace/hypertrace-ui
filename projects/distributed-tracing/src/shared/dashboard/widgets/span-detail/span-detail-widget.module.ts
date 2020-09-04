import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule, SummaryValueModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { SpanDetailModule } from '../../../components/span-detail/span-detail.module';
import { SpanDetailDataSourceModel } from './data/span-detail-data-source.model';
import { SpanDetailWidgetRendererComponent } from './span-detail-widget-renderer.component';
import { SpanDetailWidgetModel } from './span-detail-widget.model';

@NgModule({
  declarations: [SpanDetailWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [SpanDetailWidgetModel, SpanDetailDataSourceModel],
      renderers: [SpanDetailWidgetRendererComponent]
    }),
    CommonModule,
    SpanDetailModule,
    TitledContentModule,
    LoadAsyncModule,
    SummaryValueModule
  ]
})
export class SpanDetailWidgetModule {}
