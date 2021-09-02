import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MemoizeModule } from '@hypertrace/common';
import {
  ButtonModule,
  IconModule,
  LabelModule,
  LoadAsyncModule,
  OverlayModule,
  SummaryValueModule,
  TitledContentModule,
  TooltipModule
} from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ExploreFilterLinkModule } from '../../../components/explore-filter-link/explore-filter-link.module';
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
    ExploreFilterLinkModule,
    LabelModule,
    MemoizeModule,
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
