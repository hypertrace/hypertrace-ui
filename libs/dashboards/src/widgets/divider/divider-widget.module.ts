import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DividerModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { DividerWidgetRendererComponent } from './divider-widget-renderer.component';
import { DividerWidgetModel } from './divider-widget.model';

@NgModule({
  declarations: [DividerWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [DividerWidgetModel],
      renderers: [DividerWidgetRendererComponent]
    }),
    DividerModule
  ]
})
export class DividerWidgetModule {}
