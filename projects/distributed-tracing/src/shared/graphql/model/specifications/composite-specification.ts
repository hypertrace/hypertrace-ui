import { Dictionary } from '@hypertrace/common';
import { Specification } from '../schema/specifier/specification';

export interface CompositeSpecification extends Specification {
  extractFromServerData(resultContainer: Dictionary<unknown>): unknown[];
}
