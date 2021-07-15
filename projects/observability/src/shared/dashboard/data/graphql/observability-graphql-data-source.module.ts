import { TopologyMetricCategoryModel } from './topology/metrics/topology-metric-category.model';
import { TopologyMetricWithCategoryModel } from './topology/metrics/topology-metric-with-category.model';
import { TopologyMetricsModel } from './topology/metrics/topology-metrics.model';
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
import { EntityMetricAggregationDataSourceModel } from './entity/aggregation/entity-metric-aggregation-data-source.model';
import { EntitiesAttributeDataSourceModel } from './entity/attribute/entities-attribute-data-source.model';
import { EntitiesAttributeOptionsDataSourceModel } from './entity/attribute/entities-attribute-options-data-source.model';
import { EntityAttributeDataSourceModel } from './entity/attribute/entity-attribute-data-source.model';
import { EntityErrorPercentageTimeseriesDataSourceModel } from './entity/timeseries/entity-error-percentage-timeseries-data-source.model';
import { EntityMetricTimeseriesDataSourceModel } from './entity/timeseries/entity-metric-timeseries-data-source.model';
import { ExplorerVisualizationCartesianDataSourceModel } from './explorer-visualization/explorer-visualization-cartesian-data-source.model';
import { MetricAggregationDataSourceModel } from './metric-aggregation/metric-aggregation-data-source.model';
import { PercentageCompositeDataSourceModel } from './percentage/percentage-composite-data-source.model';
import { EntitySpecificationModel } from './specifiers/entity-specification.model';
import { ErrorPercentageMetricAggregationSpecificationModel } from './specifiers/error-percentage-metric-aggregation.model';
import { ExploreSelectionSpecificationModel } from './specifiers/explore-selection-specification.model';
import { ExploreIntervalTimestampSelectionSpecificationModel } from './specifiers/explore/explorer-interval-timestamp-selection.model';
import { MetricTimeseriesBandSpecificationModel } from './specifiers/metric-timeseries-band-specification.model';
import { MetricTimeseriesSpecificationModel } from './specifiers/metric-timeseries-specification.model';
import { NeighborEntitySpecificationModel } from './specifiers/neighbor-entity-specification.model';
import { PercentileLatencyAggregationSpecificationModel } from './specifiers/percentile-latency-metric-aggregation.model';
import { EntityTableDataSourceModel } from './table/entity/entity-table-data-source.model';
import { ExploreTableDataSourceModel } from './table/explore/explore-table-data-source.model';
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
        ExploreSelectionSpecificationModel,
        ExploreIntervalTimestampSelectionSpecificationModel,
        ExploreTableDataSourceModel,
        ApiTraceWaterfallDataSourceModel,
        EntityMetricTimeseriesDataSourceModel,
        EntityMetricAggregationDataSourceModel,
        TopologyDataSourceModel,
        TopologyMetricsModel,
        TopologyMetricWithCategoryModel,
        TopologyMetricCategoryModel,
        EntityTableDataSourceModel,
        InteractionsTableDataSourceModel,
        EntityAttributeDataSourceModel,
        EntitiesAttributeDataSourceModel,
        EntitiesAttributeOptionsDataSourceModel,
        EntitySpecificationModel,
        NeighborEntitySpecificationModel,
        ExplorerVisualizationCartesianDataSourceModel,
        ApiCallsCountDataSourceModel,
        EntityErrorPercentageTimeseriesDataSourceModel,
        TraceMetricTimeseriesDataSourceModel,
        TraceMetricAggregationDataSourceModel,
        TraceDonutDataSourceModel,
        MetricTimeseriesSpecificationModel,
        MetricTimeseriesBandSpecificationModel,
        ErrorPercentageMetricAggregationSpecificationModel,
        PercentileLatencyAggregationSpecificationModel,
        PercentageCompositeDataSourceModel,
        MetricAggregationDataSourceModel
      ]
    })
  ]
})
export class ObservabilityGraphQlDataSourceModule {}
