import { Dictionary } from '@hypertrace/common';
import { MetricAggregation } from '../../metrics/metric-aggregation';
import { GraphQlMetricAggregation } from '../metric/graphql-metric-aggregation';
import { MetricAggregationSpecification } from './metric-aggregation-specification';

export interface PercentileLatencyMetricAggregationSpecification extends MetricAggregationSpecification {
  extractFromServerData(
    resultContainer: Dictionary<Dictionary<GraphQlMetricAggregation>>
  ): PercentileLatencyMetricAggregation;
}

export interface PercentileLatencyMetricAggregation extends MetricAggregation {
  category: PercentileLatencyMetricValueCategory;
  units: string;
}

export const enum PercentileLatencyMetricValueCategory {
  LessThan20 = 'less-than-20',
  From20To100 = 'from-20-to-100',
  From100To500 = 'from-100-to-500',
  From500To1000 = 'from-500-to-1000',
  GreaterThanOrEqualTo1000 = 'greater-than-or-equal-to-1000',
  NotSpecified = 'not-specified'
}
