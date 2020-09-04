import { Dictionary } from '@hypertrace/common';
import { Specification } from '../schema/specifier/specification';
import { TraceStatus } from '../schema/trace';

export interface TraceStatusSpecification extends Specification {
  extractFromServerData(resultContainer: Dictionary<unknown>): TraceStatus;
}
