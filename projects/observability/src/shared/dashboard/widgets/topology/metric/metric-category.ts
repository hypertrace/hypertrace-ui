import { Dictionary } from '@hypertrace/common';
import { MetricAggregation } from '@hypertrace/distributed-tracing';
import { isEmpty } from 'lodash-es';
import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { EdgeMetricCategory } from './edge-metric-category';
import { NodeMetricCategory } from './node-metric-category';

export const getTopologyMetric = (
  data: Dictionary<unknown>,
  spec?: MetricAggregationSpecification
): MetricAggregation | undefined => {
  if (!spec) {
    return undefined;
  }

  return data[spec.resultAlias()] as MetricAggregation;
};

export type MetricCategory = NodeMetricCategory | EdgeMetricCategory;

export const resolveMetricCategories = (
  defaultCategories: MetricCategory[],
  categories?: MetricCategory[]
): MetricCategory[] => {
  const currentCategories = !isEmpty(categories) ? categories! : [];

  return defaultCategories.map(defaultCategory => {
    const category = currentCategories.find(currentCategory => currentCategory.value === defaultCategory.value);
    if (category) {
      return { ...defaultCategory, ...category };
    }

    return defaultCategory;
  });
};
