import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { MetricDisplayModule } from '../../../components/metric-display/metric-display.module';
import { MetricDisplayWidgetRendererComponent } from './metric-display-widget-renderer.component';
import { MetricDisplayWidgetModel } from './metric-display-widget.model';

@NgModule({
  declarations: [MetricDisplayWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [MetricDisplayWidgetModel],
      renderers: [MetricDisplayWidgetRendererComponent]
    }),
    MetricDisplayModule,
    CommonModule,
    TitledContentModule,
    LoadAsyncModule,
    FormattingModule
  ]
})
export class MetricDisplayWidgetModule {}
