import { Dictionary } from '@hypertrace/common';
import { GraphQlMetricAggregation, GraphQlMetricAggregationContainer } from './graphql-metric-aggregation';

export type GraphQlMetricTimeseriesContainer = Dictionary<GraphQlMetricInterval[]>;

export interface GraphQlMetricInterval
  extends GraphQlMetricAggregationContainer<Pick<GraphQlMetricAggregation, 'value' | 'lowerBound' | 'upperBound'>> {
  startTime: string;
}
