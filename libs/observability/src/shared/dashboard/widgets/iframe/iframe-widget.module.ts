import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { IframeWidgetRendererComponent } from './iframe-widget-renderer.component';
import { IFrameWidgetModel } from './iframe-widget.model';

@NgModule({
  declarations: [IframeWidgetRendererComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [IFrameWidgetModel],
      renderers: [IframeWidgetRendererComponent]
    })
  ]
})
export class IframeWidgetModule {}
