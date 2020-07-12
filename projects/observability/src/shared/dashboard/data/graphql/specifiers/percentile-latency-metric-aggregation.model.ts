import { Dictionary } from '@hypertrace/common';
import { MetricAggregationType, SpecificationModel } from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import { GraphQlMetricAggregation } from '../../../../graphql/model/schema/metric/graphql-metric-aggregation';
import {
  PercentileLatencyMetricAggregation,
  PercentileLatencyMetricAggregationSpecification
} from '../../../../graphql/model/schema/specifications/percentile-latency-aggregation-specification';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';

@Model({
  type: 'percentile-latency-metric-aggregation',
  displayName: 'Latency'
})
export class PercentileLatencyAggregationSpecificationModel extends SpecificationModel<
  PercentileLatencyMetricAggregationSpecification
> {
  public readonly aggregation: MetricAggregationType = MetricAggregationType.P99;

  protected buildInnerSpec(): PercentileLatencyMetricAggregationSpecification {
    return new ObservabilitySpecificationBuilder().metricAggregationSpecForLatency(
      MetricAggregationType.P99,
      `${this.aggregation}Latency`,
      this.displayName
    );
  }

  public extractFromServerData(
    resultContainer: Dictionary<Dictionary<GraphQlMetricAggregation>>
  ): PercentileLatencyMetricAggregation {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
