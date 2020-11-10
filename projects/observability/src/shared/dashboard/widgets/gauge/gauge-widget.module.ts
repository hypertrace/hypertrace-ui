import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { GaugeModule } from '../../../components/gauge/gauge.module';
import { GaugeWidgetRendererComponent } from './gauge-widget-renderer.component';
import { GaugeWidgetModel } from './gauge-widget.model';

@NgModule({
  declarations: [GaugeWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [GaugeWidgetModel],
      renderers: [GaugeWidgetRendererComponent]
    }),
    GaugeModule,
    CommonModule,
    TitledContentModule,
    LoadAsyncModule,
    FormattingModule
  ]
})
export class GaugeWidgetModule {}
