import { Dictionary } from '@hypertrace/common';
import { Specification } from '@hypertrace/observability';
import { Entity } from '../entity';

export interface EntitySpecification extends Specification {
  extractFromServerData(resultContainer: Dictionary<unknown>): Entity;
}
