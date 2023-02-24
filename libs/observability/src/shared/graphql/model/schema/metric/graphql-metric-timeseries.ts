import { Dictionary } from '@hypertrace/common';
import {
  GraphQlMetricAggregation,
  GraphQlMetricAggregationContainer,
  GraphQlMetricBandAggregation
} from './graphql-metric-aggregation';

export type GraphQlMetricTimeseriesContainer = Dictionary<GraphQlMetricInterval[]>;

export interface GraphQlMetricInterval
  extends GraphQlMetricAggregationContainer<Pick<GraphQlMetricAggregation, 'value'>> {
  startTime: string;
}

export type GraphQlMetricTimeseriesBandContainer = Dictionary<GraphQlMetricBandInterval[]>;

export interface GraphQlMetricBandInterval
  extends GraphQlMetricAggregationContainer<Pick<GraphQlMetricBandAggregation, 'value' | 'lowerBound' | 'upperBound'>> {
  startTime: string;
}
