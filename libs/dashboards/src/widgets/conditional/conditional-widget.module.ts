import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ConditionalWidgetRendererComponent } from './conditional-widget-renderer.component';
import { ConditionalModel } from './conditional.model';

@NgModule({
  declarations: [ConditionalWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [ConditionalModel],
      renderers: [ConditionalWidgetRendererComponent]
    })
  ]
})
export class ConditionalWidgetModule {}
