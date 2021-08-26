import { Dictionary, PartialBy } from '@hypertrace/common';
import { AttributeMetadataType } from '../../metadata/attribute-metadata';
import { MetricSpecification } from '../../specifications/metric-specification';

export interface ExploreSpecification extends PartialBy<MetricSpecification, 'aggregation'> {
  extractFromServerData(resultContainer: Dictionary<ExploreValue>): ExploreValue;
}

export interface ExploreValue<V = unknown> {
  value: V;
  type: AttributeMetadataType;
}
