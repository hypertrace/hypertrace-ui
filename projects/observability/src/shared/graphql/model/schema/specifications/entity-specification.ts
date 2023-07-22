import { Dictionary } from '@hypertrace/common';
import { Entity } from '../entity';
import { Specification } from '../specifier/specification';

export interface EntitySpecification extends Specification {
  extractFromServerData(resultContainer: Dictionary<unknown>): Entity;
}
