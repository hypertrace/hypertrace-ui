import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  JsonViewerModule,
  LabelModule,
  LoadAsyncModule,
  TableModule,
  ToggleButtonModule
} from '@hypertrace/components';
import { SpanDetailModule } from '@hypertrace/distributed-tracing';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ApiDefinitionWidgetRendererComponent } from './api-definition-widget-renderer.component';
import { ApiDefinitionWidgetModel } from './api-definition-widget.model';
import { ApiDefinitionDataSourceModel } from './data/api-definition-data-source.model';
import { ApiDefinitionRequestComponent } from './request/api-definition-request.component';
import { ApiDefinitionResponseComponent } from './response/api-definition-response.component';

@NgModule({
  declarations: [ApiDefinitionWidgetRendererComponent, ApiDefinitionRequestComponent, ApiDefinitionResponseComponent],
  imports: [
    DashboardCoreModule.with({
      models: [ApiDefinitionDataSourceModel, ApiDefinitionWidgetModel],
      renderers: [ApiDefinitionWidgetRendererComponent]
    }),
    CommonModule,
    SpanDetailModule,
    LabelModule,
    LoadAsyncModule,
    ToggleButtonModule,
    TableModule,
    JsonViewerModule
  ]
})
export class ApiDefinitionWidgetModule {}
