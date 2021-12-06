import { assertUnreachable } from '@hypertrace/common';
import { AttributeMetadata } from '../metadata/attribute-metadata';
import { MetricHealth } from './metric-health';

export interface MetricAggregation {
  value: number;
  health: MetricHealth;
  units?: string;
}

export const isMetricAggregation = (value: unknown): value is MetricAggregation =>
  typeof value === 'object' && value !== null && value.hasOwnProperty('value') && value.hasOwnProperty('health');

export const enum MetricAggregationType {
  Sum = 'sum',
  Average = 'avg',
  P99 = 'p99',
  P90 = 'p90',
  P95 = 'p95',
  P50 = 'p50',
  Min = 'min',
  Max = 'max',
  AvgrateSecond = 'avgrate_sec',
  AvgrateMinute = 'avgrate_min',
  Count = 'count',
  DistinctCount = 'distinct_count'
}

export const getAggregationDisplayName = (aggregation: MetricAggregationType): string => {
  switch (aggregation) {
    case MetricAggregationType.Average:
      return 'Avg.';
    case MetricAggregationType.P99:
      return 'p99';
    case MetricAggregationType.P95:
      return 'p95';
    case MetricAggregationType.P90:
      return 'p90';
    case MetricAggregationType.P50:
      return 'p50';
    case MetricAggregationType.Min:
      return 'Min.';
    case MetricAggregationType.Max:
      return `Max.`;
    case MetricAggregationType.Sum:
      return `Sum`;
    case MetricAggregationType.AvgrateMinute:
      return `Rate (min.)`;
    case MetricAggregationType.AvgrateSecond:
      return `Rate (sec.)`;
    case MetricAggregationType.Count:
      return 'Count';
    case MetricAggregationType.DistinctCount:
      return 'Distinct Count';
    default:
      return assertUnreachable(aggregation);
  }
};

export const getAggregationUnitDisplayName = (
  attribute?: AttributeMetadata,
  aggregation?: MetricAggregationType
): string => {
  if (attribute === undefined || aggregation === undefined) {
    return '';
  }

  switch (aggregation) {
    case MetricAggregationType.Average:
    case MetricAggregationType.P99:
    case MetricAggregationType.P95:
    case MetricAggregationType.P90:
    case MetricAggregationType.P50:
    case MetricAggregationType.Min:
    case MetricAggregationType.Max:
    case MetricAggregationType.Sum:
      return attribute.units;
    case MetricAggregationType.AvgrateMinute:
      return `${attribute.units}/m`;
    case MetricAggregationType.AvgrateSecond:
      return `${attribute.units}/s`;
    case MetricAggregationType.Count:
    case MetricAggregationType.DistinctCount:
      return '';
    default:
      return assertUnreachable(aggregation);
  }
};

export const addAggregationToDisplayName = (displayName: string, aggregation: MetricAggregationType): string => {
  switch (aggregation) {
    case MetricAggregationType.Average:
    case MetricAggregationType.P99:
    case MetricAggregationType.P95:
    case MetricAggregationType.P90:
    case MetricAggregationType.P50:
      return displayName;
    case MetricAggregationType.Min:
    case MetricAggregationType.Max:
    case MetricAggregationType.Sum: // Prefix aggregation
      return `${getAggregationDisplayName(aggregation)} ${displayName}`;
    case MetricAggregationType.Count:
    case MetricAggregationType.DistinctCount:
    case MetricAggregationType.AvgrateMinute:
    case MetricAggregationType.AvgrateSecond: // Postfix aggregation
      return `${displayName} ${getAggregationDisplayName(aggregation)}`;
    default:
      return assertUnreachable(aggregation);
  }
};
