import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HighlightedLabelModule, LoadAsyncModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { HighlightedLabelWidgetRendererComponent } from './highlighted-label-widget-renderer.component';
import { HighlightedLabelWidgetModel } from './highlighted-label-widget.model';

@NgModule({
  declarations: [HighlightedLabelWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [HighlightedLabelWidgetModel],
      renderers: [HighlightedLabelWidgetRendererComponent]
    }),
    HighlightedLabelModule,
    LoadAsyncModule
  ]
})
export class HighlightedLabelWidgetModule {}
