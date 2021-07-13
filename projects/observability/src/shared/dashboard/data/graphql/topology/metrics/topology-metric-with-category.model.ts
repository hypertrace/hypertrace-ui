import { MetricAggregationSpecificationModel } from '@hypertrace/observability';
import { ARRAY_PROPERTY, Model, ModelModelPropertyTypeInstance, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';

@Model({
  type: 'topology-metric-with-category'
})
export class TopologyMetricWithCategoryModel {
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
  public categories: MetricAggregationSpecificationModel[] = [];
}
