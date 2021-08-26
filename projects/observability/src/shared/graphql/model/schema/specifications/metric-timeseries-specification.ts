import { Dictionary, TimeDuration } from '@hypertrace/common';
import { MetricTimeseriesInterval } from '../../metric/metric-timeseries';
import { MetricSpecification } from '../../specifications/metric-specification';
import { GraphQlMetricTimeseriesContainer } from '../metric/graphql-metric-timeseries';

export interface MetricTimeseriesSpecification extends MetricSpecification {
  extractFromServerData(resultContainer: Dictionary<GraphQlMetricTimeseriesContainer>): MetricTimeseriesInterval[];
  getIntervalDuration(): TimeDuration | undefined;
  withNewIntervalDuration(intervalDuration: TimeDuration): MetricTimeseriesSpecification;
}
