import { TimeDuration } from '@hypertrace/common';
import { GraphQlTimeRange } from '../schema/timerange/graphql-time-range';

export interface MetricTimeseriesInterval {
  timestamp: Date;
  value: number;
}

export interface MetricTimeseriesBandInterval {
  timestamp: Date;
  upperBound: number;
  lowerBound: number;
}

export const getZeroFilledMetricTimeseriesIntervals = (
  metrics: MetricTimeseriesInterval[],
  interval: TimeDuration,
  timeRange: GraphQlTimeRange
): MetricTimeseriesInterval[] => {
  // This should add missing data to array

  // Add all intervals
  const buckets = [];
  const intervalDuration = interval.toMillis();
  const startTime = Math.floor(timeRange.from.valueOf() / intervalDuration) * intervalDuration;
  const endTime = Math.ceil(timeRange.to.valueOf() / intervalDuration) * intervalDuration;

  for (let timestamp = startTime; timestamp < endTime; timestamp = timestamp + intervalDuration) {
    buckets.push(timestamp);
  }

  const resultBucketMap: Map<number, MetricTimeseriesInterval> = new Map(
    metrics.map(metric => [metric.timestamp.getTime(), metric])
  );

  return buckets.map(
    timestamp =>
      resultBucketMap.get(timestamp) ?? {
        value: 0,
        timestamp: new Date(timestamp)
      }
  );
};
