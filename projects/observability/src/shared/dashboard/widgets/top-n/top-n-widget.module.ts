import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LabelModule, LoadAsyncModule, SelectModule, TitledContentModule, TooltipModule } from '@hypertrace/components';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { SortNChartModule } from '../../../components/sort-n/sort-n-chart.module';
import { EntitiesGraphQlQueryHandlerService } from '../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';
import { TopNDataSourceModel } from './data/top-n-data-source.model';
import { TopNExploreSelectionSpecificationModel } from './data/top-n-explore-selection-specification.model';
import { TopNWidgetRendererComponent } from './top-n-widget-renderer.component';
import { TopNWidgetModel } from './top-n-widget.model';

@NgModule({
  declarations: [TopNWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [TopNWidgetModel, TopNDataSourceModel, TopNExploreSelectionSpecificationModel],
      renderers: [TopNWidgetRendererComponent]
    }),
    GraphQlModule.withHandlerProviders([EntitiesGraphQlQueryHandlerService]),
    CommonModule,
    TitledContentModule,
    LoadAsyncModule,
    SelectModule,
    LabelModule,
    TooltipModule,
    FormattingModule,
    SortNChartModule
  ]
})
export class TopNWidgetModule {}
