import { Dictionary } from '@hypertrace/common';
import { EnrichedAttribute } from '../schema/enriched-attribute';
import { Specification } from '../schema/specifier/specification';

export interface EnrichedAttributeSpecification extends Specification {
  extractFromServerData<T = unknown>(resultContainer: Dictionary<unknown>): EnrichedAttribute<T>;
}
