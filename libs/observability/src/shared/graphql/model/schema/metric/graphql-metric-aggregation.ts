export const enum GraphQlMetricAggregationPath {
  Sum = 'sum',
  Average = 'avg',
  Min = 'min',
  Max = 'max',
  Avgrate = 'avgrate',
  Count = 'count',
  Percentile = 'percentile',
  DistinctCount = 'distinctcount'
}

export interface GraphQlMetricAggregation {
  value: number;
}

export interface GraphQlMetricBandAggregation {
  value: number;
  upperBound: number;
  lowerBound: number;
}

export type GraphQlMetricAggregationContainer<T extends Partial<GraphQlMetricAggregation> = GraphQlMetricAggregation> =
  {
    [key in GraphQlMetricAggregationPath]?: T;
  };
