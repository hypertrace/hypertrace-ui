import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ButtonModule,
  IconModule,
  LabelModule,
  LinkModule,
  LoadAsyncModule,
  OverlayModule,
  SummaryValueModule,
  TitledContentModule,
  TooltipModule
} from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { SpanDetailModule } from '../../../components/span-detail/span-detail.module';
import { WaterfallWidgetRendererComponent } from './waterfall-widget-renderer.component';
import { WaterfallWidgetModel } from './waterfall-widget.model';
import { WaterfallChartModule } from './waterfall/waterfall-chart.module';

@NgModule({
  declarations: [WaterfallWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [WaterfallWidgetModel],
      renderers: [WaterfallWidgetRendererComponent]
    }),
    CommonModule,
    LabelModule,
    LinkModule,
    SpanDetailModule,
    OverlayModule,
    TooltipModule,
    TitledContentModule,
    LoadAsyncModule,
    ButtonModule,
    IconModule,
    SummaryValueModule,
    WaterfallChartModule
  ]
})
export class WaterfallWidgetModule {}
