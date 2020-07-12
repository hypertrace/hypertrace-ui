import { Dictionary } from '@hypertrace/common';
import { MetricAggregation, MetricSpecification } from '@hypertrace/distributed-tracing';
import { GraphQlMetricAggregation } from '../metric/graphql-metric-aggregation';

export interface MetricAggregationSpecification extends MetricSpecification {
  extractFromServerData(resultContainer: Dictionary<Dictionary<GraphQlMetricAggregation>>): MetricAggregation;
}
