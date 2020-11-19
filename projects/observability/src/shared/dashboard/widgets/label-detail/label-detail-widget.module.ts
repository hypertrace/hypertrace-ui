import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { LabelDetailModule } from '../../../components/label-detail/label-detail.module';
import { LabelDetailWidgetRendererComponent } from './label-detail-widget-renderer.component';
import { LabelDetailWidgetModel } from './label-detail-widget.model';

@NgModule({
  declarations: [LabelDetailWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [LabelDetailWidgetModel],
      renderers: [LabelDetailWidgetRendererComponent]
    }),
    LabelDetailModule,
    CommonModule,
    TitledContentModule,
    LoadAsyncModule,
    FormattingModule
  ]
})
export class LabelDetailWidgetModule {}
