import { Specification } from '@hypertrace/distributed-tracing';
import { ObservabilityEntityType } from './entity';

export const enum NeighborDirection {
  Upstream = 'upstream',
  Downstream = 'downstream'
}

export interface DefinesNeighbor {
  neighborType: ObservabilityEntityType;
  neighborDirection: NeighborDirection;
}

export const specificationDefinesNeighbor = (
  spec: Specification & Partial<DefinesNeighbor>
): spec is Specification & DefinesNeighbor =>
  typeof spec.neighborDirection === 'string' && typeof spec.neighborType === 'string';
