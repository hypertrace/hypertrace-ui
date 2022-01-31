import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { MetricAggregationType } from '../../../../graphql/model/metrics/metric-aggregation';
import { MetricSpecification } from '../../../../graphql/model/specifications/metric-specification';
import { SpecificationModel } from './specification.model';

export abstract class MetricSpecificationModel<TSpecification extends MetricSpecification>
  extends SpecificationModel<TSpecification>
  implements MetricSpecification
{
  @ModelProperty({
    key: 'metric',
    displayName: 'Metric',
    type: STRING_PROPERTY.type,
    required: true
  })
  public metric!: string;

  @ModelProperty({
    key: 'aggregation',
    displayName: 'Aggregation',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [
        MetricAggregationType.Average,
        MetricAggregationType.P99,
        MetricAggregationType.P95,
        MetricAggregationType.P90,
        MetricAggregationType.P50,
        MetricAggregationType.Min,
        MetricAggregationType.Max,
        MetricAggregationType.Sum,
        MetricAggregationType.AvgrateMinute,
        MetricAggregationType.AvgrateSecond,
        MetricAggregationType.Count
      ]
    } as EnumPropertyTypeInstance
  })
  public aggregation!: MetricAggregationType;
}
