import { Dictionary, TimeDuration } from '@hypertrace/common';
import { MetricSpecification } from '@hypertrace/distributed-tracing';
import { MetricTimeseriesInterval } from '../../metric/metric-timeseries';
import { GraphQlMetricTimeseriesContainer } from '../metric/graphql-metric-timeseries';

export interface MetricTimeseriesSpecification extends MetricSpecification {
  extractFromServerData(resultContainer: Dictionary<GraphQlMetricTimeseriesContainer>): MetricTimeseriesInterval[];
  getIntervalDuration(): TimeDuration | undefined;
  withNewIntervalDuration(intervalDuration?: TimeDuration): MetricTimeseriesSpecification;
}
