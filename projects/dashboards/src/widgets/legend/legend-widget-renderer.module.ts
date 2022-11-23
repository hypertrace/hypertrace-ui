import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { LegendWidgetRendererComponent } from './legend-widget-renderer.component';
import { LegendWidgetModel } from './legend-widget.model';

@NgModule({
  declarations: [LegendWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [LegendWidgetModel],
      renderers: [LegendWidgetRendererComponent]
    })
  ]
})
export class LegendWidgetModule {}
