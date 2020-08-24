import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ExploreGraphQlQueryHandlerService } from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { MetricAggregationDataSourceModel } from '../metric-aggregation/metric-aggregation-data-source.model';
import { PercentageDataSourceModel } from './percentage-data-source.model';

@NgModule({
  declarations: [],
  imports: [
    DashboardCoreModule.with({
      models: [PercentageDataSourceModel, MetricAggregationDataSourceModel]
    }),
    GraphQlModule.withHandlerProviders([ExploreGraphQlQueryHandlerService]),
    CommonModule
  ]
})
export class PercentageDataSourceModule {}
