import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GreetingLabelModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { GreetingLabelWidgetRendererComponent } from './greeting-label-widget-renderer.component';
import { GreetingLabelWidgetModel } from './greeting-label-widget.model';

@NgModule({
  declarations: [GreetingLabelWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [GreetingLabelWidgetModel],
      renderers: [GreetingLabelWidgetRendererComponent]
    }),
    GreetingLabelModule
  ]
})
export class GreetingLabelWidgetModule {}
