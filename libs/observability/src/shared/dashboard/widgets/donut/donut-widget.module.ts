import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { DonutModule } from '../../../components/donut/donut.module';
import { DonutWidgetRendererComponent } from './donut-widget-renderer.component';
import { DonutWidgetModel } from './donut-widget.model';

@NgModule({
  declarations: [DonutWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [DonutWidgetModel],
      renderers: [DonutWidgetRendererComponent]
    }),
    DonutModule,
    CommonModule,
    TitledContentModule,
    LoadAsyncModule,
    FormattingModule
  ]
})
export class DonutWidgetModule {}
