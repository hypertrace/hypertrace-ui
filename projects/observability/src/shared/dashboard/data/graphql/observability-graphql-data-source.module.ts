import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { EntitiesGraphQlQueryHandlerService } from '../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';
import { EntityGraphQlQueryHandlerService } from '../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { InteractionsGraphQlQueryHandlerService } from '../../../graphql/request/handlers/entities/query/interactions/interactions-graphql-query-handler.service';
import { EntityTopologyGraphQlQueryHandlerService } from '../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { ExploreGraphQlQueryHandlerService } from '../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { ApiCallsCountDataSourceModel } from './api-calls-count/api-calls-count-data-source-model';
import { ApiErrorPercentageDataSourceModel } from './api-error-percentage/api-error-percentage-data-source.model';
import { EntityMetricAggregationDataSourceModel } from './entity/aggregation/entity-metric-aggregation-data-source.model';
import { EntityAttributeDataSourceModel } from './entity/attribute/entity-attribute-data-source.model';
import { EntityErrorPercentageTimeseriesDataSourceModel } from './entity/timeseries/entity-error-percentage-timeseries-data-source.model';
import { EntityMetricTimeseriesDataSourceModel } from './entity/timeseries/entity-metric-timeseries-data-source.model';
import { ExploreCartesianDataSourceModel } from './explore/explore-cartesian-data-source.model';
import { EntitySpecificationModel } from './specifiers/entity-specification.model';
import { ErrorPercentageMetricAggregationSpecificationModel } from './specifiers/error-percentage-metric-aggregation.model';
import { MetricTimeseriesSpecificationModel } from './specifiers/metric-timeseries-specification.model';
import { NeighborEntitySpecificationModel } from './specifiers/neighbor-entity-specification.model';
import { PercentileLatencyAggregationSpecificationModel } from './specifiers/percentile-latency-metric-aggregation.model';
import { EntityTableDataSourceModel } from './table/entity/entity-table-data-source.model';
import { InteractionsTableDataSourceModel } from './table/interactions/interactions-table-data-source.model';
import { TopologyDataSourceModel } from './topology/topology-data-source.model';
import { TraceMetricAggregationDataSourceModel } from './trace/aggregation/trace-metric-aggregation-data-source.model';
import { TraceDonutDataSourceModel } from './trace/donut/trace-donut-data-source.model';
import { TraceMetricTimeseriesDataSourceModel } from './trace/timeseries/trace-metric-timeseries-data-source.model';
import { ApiTraceWaterfallDataSourceModel } from './waterfall/api-trace-waterfall-data-source.model';

@NgModule({
  imports: [
    HttpClientModule,
    GraphQlModule.withHandlerProviders([
      EntitiesGraphQlQueryHandlerService,
      EntityGraphQlQueryHandlerService,
      EntityTopologyGraphQlQueryHandlerService,
      InteractionsGraphQlQueryHandlerService,
      ExploreGraphQlQueryHandlerService
    ]),
    DashboardCoreModule.with({
      models: [
        ApiTraceWaterfallDataSourceModel,
        EntityMetricTimeseriesDataSourceModel,
        EntityMetricAggregationDataSourceModel,
        TopologyDataSourceModel,
        EntityTableDataSourceModel,
        InteractionsTableDataSourceModel,
        EntityAttributeDataSourceModel,
        EntitySpecificationModel,
        NeighborEntitySpecificationModel,
        ExploreCartesianDataSourceModel,
        ApiErrorPercentageDataSourceModel,
        ApiCallsCountDataSourceModel,
        EntityErrorPercentageTimeseriesDataSourceModel,
        TraceMetricTimeseriesDataSourceModel,
        TraceMetricAggregationDataSourceModel,
        TraceDonutDataSourceModel,
        MetricTimeseriesSpecificationModel,
        ErrorPercentageMetricAggregationSpecificationModel,
        PercentileLatencyAggregationSpecificationModel
      ]
    })
  ]
})
export class ObservabilityGraphQlDataSourceModule {}
