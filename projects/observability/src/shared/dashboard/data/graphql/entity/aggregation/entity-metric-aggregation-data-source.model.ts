import { Model, ModelModelPropertyTypeInstance, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { MetricAggregation } from '../../../../../graphql/model/metrics/metric-aggregation';
import { MetricAggregationSpecification } from '../../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { MetricAggregationSpecificationModel } from '../../specifiers/metric-aggregation-specification.model';
import { EntityValueDataSourceModel } from '../entity-value-data-source.model';

@Model({
  type: 'entity-metric-aggregation-data-source'
})
export class EntityMetricAggregationDataSourceModel extends EntityValueDataSourceModel<MetricAggregation> {
  @ModelProperty({
    key: 'metric',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: MetricAggregationSpecificationModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public specification!: MetricAggregationSpecification;

  public getData(): Observable<MetricAggregation> {
    return this.fetchSpecificationData();
  }
}
