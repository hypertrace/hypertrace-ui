import { assertUnreachable } from '@hypertrace/common';
import { MetricAggregationType } from '@hypertrace/observability';
import { GraphQlMetricAggregationPath } from '../../../../model/schema/metric/graphql-metric-aggregation';

export const convertToGraphQlMetricAggregationPath = (value: MetricAggregationType): GraphQlMetricAggregationPath => {
  switch (value) {
    case MetricAggregationType.Average:
      return GraphQlMetricAggregationPath.Average;
    case MetricAggregationType.P99:
    case MetricAggregationType.P95:
    case MetricAggregationType.P90:
    case MetricAggregationType.P50:
      return GraphQlMetricAggregationPath.Percentile;
    case MetricAggregationType.Max:
      return GraphQlMetricAggregationPath.Max;
    case MetricAggregationType.Min:
      return GraphQlMetricAggregationPath.Min;
    case MetricAggregationType.AvgrateMinute:
    case MetricAggregationType.AvgrateSecond:
      return GraphQlMetricAggregationPath.Avgrate;
    case MetricAggregationType.Sum:
      return GraphQlMetricAggregationPath.Sum;
    case MetricAggregationType.Count:
      return GraphQlMetricAggregationPath.Count;
    case MetricAggregationType.DistinctCount:
      return GraphQlMetricAggregationPath.DistinctCount;
    default:
      return assertUnreachable(value);
  }
};
