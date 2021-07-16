import { Dictionary } from '@hypertrace/common';
import { MetricAggregation } from '@hypertrace/distributed-tracing';
import {
  ARRAY_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType
} from '@hypertrace/hyperdash';
import { MetricAggregationSpecificationModel } from '../../specifiers/metric-aggregation-specification.model';
import { MetricAggregationSpecification } from './../../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { TopologyMetricCategoryData, TopologyMetricCategoryModel } from './topology-metric-category.model';

@Model({
  type: 'topology-metric-with-category'
})
export class TopologyMetricWithCategoryModel implements TopologyMetricWithCategoryData {
  @ModelProperty({
    key: 'specification',
    required: true,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: MetricAggregationSpecificationModel
    } as ModelModelPropertyTypeInstance
  })
  public specification!: MetricAggregationSpecificationModel;

  @ModelProperty({
    key: 'categories',
    required: false,
    type: ARRAY_PROPERTY.type
  })
  public categories: TopologyMetricCategoryModel[] = [];

  public extractAndGetDataCategoryForMetric(data: Dictionary<unknown>): TopologyMetricCategoryData | undefined {
    const aggregation = this.extractDataForMetric(data);

    return aggregation !== undefined ? this.getDataCategoryForMetric(aggregation.value) : undefined;
  }

  public extractDataForMetric(data: Dictionary<unknown>): MetricAggregation | undefined {
    return data[this.specification.resultAlias()] as MetricAggregation | undefined;
  }

  private getDataCategoryForMetric(value: number): TopologyMetricCategoryData | undefined {
    return this.categories.find(
      category => value >= category.minValue && (category.maxValue !== undefined ? value < category.maxValue : true)
    );
  }
}

export interface TopologyMetricWithCategoryData {
  specification: MetricAggregationSpecification;
  categories: TopologyMetricCategoryData[];
  extractDataForMetric(data: Dictionary<unknown>): MetricAggregation | undefined;
  extractAndGetDataCategoryForMetric(data: Dictionary<unknown>): TopologyMetricCategoryData | undefined;
}
