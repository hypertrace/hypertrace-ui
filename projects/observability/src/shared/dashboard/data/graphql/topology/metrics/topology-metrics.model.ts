import {
  ARRAY_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType
} from '@hypertrace/hyperdash';
import { TopologyMetricWithCategoryModel } from './topology-metric-with-category.model';

@Model({
  type: 'topology-metrics'
})
export class TopologyMetricsModel {
  @ModelProperty({
    key: 'primary',
    required: true,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TopologyMetricWithCategoryModel
    } as ModelModelPropertyTypeInstance
  })
  public primary!: TopologyMetricWithCategoryModel;

  @ModelProperty({
    key: 'secondary',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TopologyMetricWithCategoryModel
    } as ModelModelPropertyTypeInstance
  })
  public secondary?: TopologyMetricWithCategoryModel;

  @ModelProperty({
    key: 'others',
    required: false,
    type: ARRAY_PROPERTY.type,
  })
  public others?: TopologyMetricWithCategoryModel[];

}
