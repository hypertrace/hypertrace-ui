import { Dictionary, TimeDuration } from '@hypertrace/common';
import { MetricSpecification } from '@hypertrace/distributed-tracing';
import { MetricTimeseriesBandInterval } from '../../metric/metric-timeseries';
import { GraphQlMetricTimeseriesBandContainer, } from '../metric/graphql-metric-timeseries';

export interface MetricTimeseriesBandSpecification extends MetricSpecification {
  extractFromServerData(resultContainer: Dictionary<GraphQlMetricTimeseriesBandContainer>): MetricTimeseriesBandInterval[];
  getIntervalDuration(): TimeDuration | undefined;
  withNewIntervalDuration(intervalDuration: TimeDuration): MetricTimeseriesBandSpecification;
}
