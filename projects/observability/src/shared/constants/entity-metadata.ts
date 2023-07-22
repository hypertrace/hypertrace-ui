import { InjectionToken } from '@angular/core';

export interface EntityMetadata {
  entityType: string;
  icon: string;
  detailPath(id: string, sourceRoute?: string, inactive?: boolean): string[];
  listPath?: string[];
  apisListPath?(id: string): string[];
  sourceRoutes?: string[];
  typeDisplayName?: string;
  volatile?: boolean; // Default false; Is this entity safely cacheable i.e. can it be mutated
}

export type EntityMetadataMap = Map<string, EntityMetadata>;

export const ENTITY_METADATA = new InjectionToken<EntityMetadataMap>('ENTITY_METADATA');
