import { Dictionary, PartialBy } from '@hypertrace/common';
import { AttributeMetadataType, MetricSpecification } from '@hypertrace/observability';

export interface ExploreSpecification extends PartialBy<MetricSpecification, 'aggregation'> {
  extractFromServerData(resultContainer: Dictionary<ExploreValue>): ExploreValue;
}

export interface ExploreValue<V = unknown> {
  value: V;
  type: AttributeMetadataType;
}
