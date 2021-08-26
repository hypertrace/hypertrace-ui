import { assertUnreachable } from '@hypertrace/common';
import { MetricAggregationType } from '../../metrics/metric-aggregation';

export const enum GraphQlMetricAggregationType {
  Sum = 'SUM',
  Average = 'AVG',
  Min = 'MIN',
  Max = 'MAX',
  Avgrate = 'AVGRATE',
  Count = 'COUNT',
  Percentile = 'PERCENTILE',
  DistinctCount = 'DISTINCTCOUNT'
}

export const convertFromGraphQlMetricAggregationType = (
  value: GraphQlMetricAggregationType
): MetricAggregationType[] => {
  switch (value) {
    case GraphQlMetricAggregationType.Average:
      return [MetricAggregationType.Average];
    case GraphQlMetricAggregationType.Percentile:
      return [
        MetricAggregationType.P99,
        MetricAggregationType.P95,
        MetricAggregationType.P90,
        MetricAggregationType.P50
      ];
    case GraphQlMetricAggregationType.Max:
      return [MetricAggregationType.Max];
    case GraphQlMetricAggregationType.Min:
      return [MetricAggregationType.Min];
    case GraphQlMetricAggregationType.Avgrate:
      return [MetricAggregationType.AvgrateMinute, MetricAggregationType.AvgrateSecond];
    case GraphQlMetricAggregationType.Sum:
      return [MetricAggregationType.Sum];
    case GraphQlMetricAggregationType.Count:
      return [MetricAggregationType.Count];
    case GraphQlMetricAggregationType.DistinctCount:
      return [MetricAggregationType.DistinctCount];
    default:
      return assertUnreachable(value);
  }
};

export const convertToGraphQlMetricAggregationType = (value: MetricAggregationType): GraphQlMetricAggregationType => {
  switch (value) {
    case MetricAggregationType.Average:
      return GraphQlMetricAggregationType.Average;
    case MetricAggregationType.P99:
    case MetricAggregationType.P95:
    case MetricAggregationType.P90:
    case MetricAggregationType.P50:
      return GraphQlMetricAggregationType.Percentile;
    case MetricAggregationType.Max:
      return GraphQlMetricAggregationType.Max;
    case MetricAggregationType.Min:
      return GraphQlMetricAggregationType.Min;
    case MetricAggregationType.AvgrateMinute:
    case MetricAggregationType.AvgrateSecond:
      return GraphQlMetricAggregationType.Avgrate;
    case MetricAggregationType.Sum:
      return GraphQlMetricAggregationType.Sum;
    case MetricAggregationType.Count:
      return GraphQlMetricAggregationType.Count;
    case MetricAggregationType.DistinctCount:
      return GraphQlMetricAggregationType.DistinctCount;
    default:
      return assertUnreachable(value);
  }
};
