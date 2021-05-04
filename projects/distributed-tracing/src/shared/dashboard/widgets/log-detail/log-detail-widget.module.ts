import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListViewModule, LoadAsyncModule, SummaryValueModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { SpanDetailModule } from '../../../components/span-detail/span-detail.module';
import { LogDetailDataSourceModel } from './data/log-detail-data-source.model';
import { LogDetailWidgetRendererComponent } from './log-detail-widget-renderer.component';
import { LogDetailWidgetModel } from './log-detail-widget.model';

@NgModule({
  declarations: [LogDetailWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [LogDetailWidgetModel, LogDetailDataSourceModel],
      renderers: [LogDetailWidgetRendererComponent]
    }),
    CommonModule,
    SpanDetailModule,
    TitledContentModule,
    ListViewModule,
    LoadAsyncModule,
    SummaryValueModule
  ]
})
export class LogDetailWidgetModule {}
