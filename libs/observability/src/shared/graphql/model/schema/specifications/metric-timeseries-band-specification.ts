import { Dictionary, TimeDuration } from '@hypertrace/common';
import { MetricTimeseriesBandInterval } from '../../metric/metric-timeseries';
import { MetricSpecification } from '../../specifications/metric-specification';
import { GraphQlMetricTimeseriesBandContainer } from '../metric/graphql-metric-timeseries';

export interface MetricTimeseriesBandSpecification extends MetricSpecification {
  extractFromServerData(
    resultContainer: Dictionary<GraphQlMetricTimeseriesBandContainer>
  ): MetricTimeseriesBandInterval[];
  getIntervalDuration(): TimeDuration | undefined;
  withNewIntervalDuration(intervalDuration: TimeDuration): MetricTimeseriesBandSpecification;
}
