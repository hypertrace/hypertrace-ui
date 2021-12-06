import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { JsonWidgetRendererComponent } from './json-widget-renderer.component';
import { JsonWidgetModel } from './json-widget.model';

@NgModule({
  declarations: [JsonWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [JsonWidgetModel],
      renderers: [JsonWidgetRendererComponent]
    }),
    TitledContentModule,
    LoadAsyncModule
  ]
})
export class JsonWidgetModule {}
