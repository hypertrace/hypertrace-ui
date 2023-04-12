import { Dictionary } from '@hypertrace/common';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { Model, ModelProperty } from '@hypertrace/hyperdash';
import { MetricAggregationType } from '../../../../graphql/model/metrics/metric-aggregation';
import {
  ErrorPercentageMetricAggregation,
  ErrorPercentageMetricAggregationSpecification
} from '../../../../graphql/model/schema/specifications/error-percentage-aggregation-specification';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';
import { SpecificationModel } from './specification.model';

@Model({
  type: 'error-percentage-metric-aggregation',
  displayName: 'Error Percentage'
})
export class ErrorPercentageMetricAggregationSpecificationModel extends SpecificationModel<ErrorPercentageMetricAggregationSpecification> {
  @ModelProperty({
    key: 'aggregation',
    displayName: 'Aggregation',
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

  protected buildInnerSpec(): ErrorPercentageMetricAggregationSpecification {
    return new ObservabilitySpecificationBuilder().metricAggregationSpecForErrorPercentage(
      this.aggregation,
      this.displayName
    );
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): ErrorPercentageMetricAggregation {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
