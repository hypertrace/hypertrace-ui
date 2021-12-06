import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LinkModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { LinkWidgetRendererComponent } from './link-widget-renderer.component';
import { LinkWidgetModel } from './link-widget.model';

@NgModule({
  declarations: [LinkWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [LinkWidgetModel],
      renderers: [LinkWidgetRendererComponent]
    }),
    LinkModule
  ]
})
export class LinkWidgetModule {}
