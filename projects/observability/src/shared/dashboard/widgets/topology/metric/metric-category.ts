import { MetricAggregation, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { Dictionary } from 'lodash';
import {
  ErrorPercentageMetricAggregation,
  ErrorPercentageMetricValueCategory
} from '../../../../graphql/model/schema/specifications/error-percentage-aggregation-specification';
import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import {
  PercentileLatencyMetricAggregation,
  PercentileLatencyMetricValueCategory
} from '../../../../graphql/model/schema/specifications/percentile-latency-aggregation-specification';

export const getLatencyMetric = (
  data: Dictionary<unknown>,
  metricSpecifications?: MetricAggregationSpecification[]
): PercentileLatencyMetricAggregation | undefined => {
  const latencySpecification = metricSpecifications?.find(
    specification => specification.name === 'p99Latency' && specification.aggregation === MetricAggregationType.P99
  );

  return getTopologyMetric<PercentileLatencyMetricAggregation>(data, latencySpecification);
};

export const getErrorPercentageMetric = (
  data: Dictionary<unknown>,
  metricSpecifications?: MetricAggregationSpecification[]
): ErrorPercentageMetricAggregation | undefined => {
  const errorSpecification = metricSpecifications?.find(
    specification =>
      specification.name === 'errorPercentage' && specification.aggregation === MetricAggregationType.Average
  );

  return getTopologyMetric<ErrorPercentageMetricAggregation>(data, errorSpecification);
};

export const getAllCategoryClasses = () => [
  ...allLatencyMetricCategories.map(getLatencyCategoryClass),
  ...allErrorPercentageMetricCategories.map(getErrorPercentageCategoryClass)
];

export const getLatencyCategoryClass = (category?: PercentileLatencyMetricValueCategory): string =>
  category !== undefined ? `${category}-category` : '';

export const getErrorPercentageCategoryClass = (category?: ErrorPercentageMetricValueCategory): string =>
  category !== undefined ? `${category}-error-category` : '';

export const allLatencyMetricCategories = [
  PercentileLatencyMetricValueCategory.LessThan20,
  PercentileLatencyMetricValueCategory.From20To100,
  PercentileLatencyMetricValueCategory.From100To500,
  PercentileLatencyMetricValueCategory.From500To1000,
  PercentileLatencyMetricValueCategory.GreaterThanOrEqualTo1000,
  PercentileLatencyMetricValueCategory.NotSpecified
];

export const allErrorPercentageMetricCategories = [
  ErrorPercentageMetricValueCategory.LessThan5,
  ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5,
  ErrorPercentageMetricValueCategory.NotSpecified
];

const getTopologyMetric = <T extends MetricAggregation>(
  data: Dictionary<unknown>,
  spec?: MetricAggregationSpecification
): T | undefined => {
  if (!spec) {
    return undefined;
  }

  return data[spec.resultAlias()] as T;
};
