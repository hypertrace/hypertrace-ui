import { Dictionary } from '@hypertrace/common';
import { MetricAggregation } from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import { GraphQlMetricAggregation } from '../../../../graphql/model/schema/metric/graphql-metric-aggregation';
import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';
import { MetricSpecificationModel } from './metric-specification.model';

@Model({
  type: 'metric-aggregation',
  displayName: 'Metric'
})
export class MetricAggregationSpecificationModel
  extends MetricSpecificationModel<MetricAggregationSpecification>
  implements MetricAggregationSpecification {
  protected buildInnerSpec(): MetricAggregationSpecification {
    return new ObservabilitySpecificationBuilder().metricAggregationSpecForKey(this.metric, this.aggregation);
  }

  public extractFromServerData(resultContainer: Dictionary<Dictionary<GraphQlMetricAggregation>>): MetricAggregation {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
