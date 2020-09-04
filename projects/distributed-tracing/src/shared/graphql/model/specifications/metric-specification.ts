import { MetricAggregationType } from '../metrics/metric-aggregation';
import { Specification } from '../schema/specifier/specification';

export interface MetricSpecification extends Specification {
  aggregation: MetricAggregationType;
}

export const isMetricSpecification = (
  spec: Specification & Partial<MetricSpecification>
): spec is MetricSpecification => typeof spec.aggregation === 'string';
