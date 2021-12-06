import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { TextWidgetRendererComponent } from './text-widget-renderer.component';
import { TextWidgetModel } from './text-widget.model';

@NgModule({
  declarations: [TextWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [TextWidgetModel],
      renderers: [TextWidgetRendererComponent]
    })
  ]
})
export class TextWidgetModule {}
