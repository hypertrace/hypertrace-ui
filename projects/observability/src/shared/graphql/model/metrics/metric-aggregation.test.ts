import { getAggregationDisplayName, MetricAggregationType } from './metric-aggregation';

describe('MetricAggregation', () => {
  test('calculates display name for stand alone aggregation types', () => {
    expect(getAggregationDisplayName(MetricAggregationType.Average)).toBe('Avg.');
    expect(getAggregationDisplayName(MetricAggregationType.P99)).toBe('p99');
    expect(getAggregationDisplayName(MetricAggregationType.P95)).toBe('p95');
    expect(getAggregationDisplayName(MetricAggregationType.P90)).toBe('p90');
    expect(getAggregationDisplayName(MetricAggregationType.P50)).toBe('p50');
    expect(getAggregationDisplayName(MetricAggregationType.Min)).toBe('Min.');
    expect(getAggregationDisplayName(MetricAggregationType.Max)).toBe('Max.');
    expect(getAggregationDisplayName(MetricAggregationType.Sum)).toBe('Sum');
    expect(getAggregationDisplayName(MetricAggregationType.AvgrateSecond)).toBe('Rate (sec.)');
    expect(getAggregationDisplayName(MetricAggregationType.AvgrateMinute)).toBe('Rate (min.)');
    expect(getAggregationDisplayName(MetricAggregationType.Count)).toBe('Count');
    expect(getAggregationDisplayName(MetricAggregationType.DistinctCount)).toBe('Distinct Count');
  });
});
