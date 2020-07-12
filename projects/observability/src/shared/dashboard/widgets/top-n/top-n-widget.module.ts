import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LabelModule, LoadAsyncModule, SelectModule, TitledContentModule, TooltipModule } from '@hypertrace/components';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { TopNChartModule } from '../../../components/top-n/top-n-chart.module';
import { EntitiesGraphQlQueryHandlerService } from '../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';
import { TopNDataSourceModel } from './data/top-n-data-source.model';
import { TopNWidgetRendererComponent } from './top-n-widget-renderer.component';
import { TopNWidgetModel } from './top-n-widget.model';

@NgModule({
  declarations: [TopNWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [TopNWidgetModel, TopNDataSourceModel],
      renderers: [TopNWidgetRendererComponent]
    }),
    GraphQlModule.withHandlerProviders([EntitiesGraphQlQueryHandlerService]),
    TopNChartModule,
    CommonModule,
    TitledContentModule,
    LoadAsyncModule,
    SelectModule,
    LabelModule,
    TooltipModule,
    FormattingModule
  ]
})
export class TopNWidgetModule {}
