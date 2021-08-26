import { Dictionary } from '@hypertrace/common';
import { MetricAggregation } from '../../metrics/metric-aggregation';
import { MetricAggregationSpecification } from './metric-aggregation-specification';

export interface ErrorPercentageMetricAggregationSpecification extends MetricAggregationSpecification {
  extractFromServerData(resultContainer: Dictionary<unknown>): ErrorPercentageMetricAggregation;
}

export interface ErrorPercentageMetricAggregation extends MetricAggregation {
  category: ErrorPercentageMetricValueCategory;
  units: string;
}

export const enum ErrorPercentageMetricValueCategory {
  LessThan5 = 'less-than-5',
  GreaterThanOrEqualTo5 = 'greater-than-or-equal-to-5',
  NotSpecified = 'not-specified'
}
