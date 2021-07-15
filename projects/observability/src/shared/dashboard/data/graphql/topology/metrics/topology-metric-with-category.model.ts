import { Dictionary } from './../../../../../../../../common/src/utilities/types/types';
import { MetricAggregationSpecification } from './../../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { ARRAY_PROPERTY, Model, ModelModelPropertyTypeInstance, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { TopologyMetricCategoryModel, TopologyMetricCategoryData } from './topology-metric-category.model';
import { MetricAggregation } from '@hypertrace/distributed-tracing';
import { MetricAggregationSpecificationModel } from '../../specifiers/metric-aggregation-specification.model';

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
    type: ARRAY_PROPERTY.type,
  })
  public categories: TopologyMetricCategoryModel[] = [];

  public extractAndGetDataCategoryForMetric(data: Dictionary<unknown>): TopologyMetricCategoryData | undefined {
    const aggregation =  this.extractDataForMetric(data);
    return aggregation !== undefined ? this.getDataCategoryForMetric(aggregation.value) : undefined;
  }

  public extractDataForMetric(data: Dictionary<unknown>): MetricAggregation | undefined {
    return  data[this.specification.resultAlias()] as MetricAggregation | undefined;
  }

  private getDataCategoryForMetric(value: number): TopologyMetricCategoryData | undefined {
    return this.categories.find(category => value >= category.minValue && (category.maxValue !== undefined && value < category.maxValue));
  }
}

export interface TopologyMetricWithCategoryData {
  specification: MetricAggregationSpecification;
  categories: TopologyMetricCategoryData[];
  extractDataForMetric(data: Dictionary<unknown>): MetricAggregation | undefined
  extractAndGetDataCategoryForMetric(data: Dictionary<unknown>): TopologyMetricCategoryData | undefined

}
