import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { EdgeMetricCategory } from './edge-metric-category';
import { NodeMetricCategory } from './node-metric-category';

export interface MetricData {
  primary: MetricType;
  secondary?: MetricType;
  others?: MetricType[];
}

export type MetricType = NodeMetric | EdgeMetric;

export interface Metric {
  specification: MetricAggregationSpecification;
}

export interface NodeMetric extends Metric {
  categories?: NodeMetricCategory[];
}

export interface EdgeMetric extends Metric {
  categories?: EdgeMetricCategory[];
}
