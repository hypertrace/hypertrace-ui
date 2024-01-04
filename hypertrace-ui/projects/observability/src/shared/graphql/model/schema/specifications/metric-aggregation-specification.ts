import { Dictionary } from '@hypertrace/common';
import { MetricAggregation } from '../../metrics/metric-aggregation';
import { MetricSpecification } from '../../specifications/metric-specification';
import { GraphQlMetricAggregation } from '../metric/graphql-metric-aggregation';

export interface MetricAggregationSpecification extends MetricSpecification {
  extractFromServerData(resultContainer: Dictionary<Dictionary<GraphQlMetricAggregation>>): MetricAggregation;
}
