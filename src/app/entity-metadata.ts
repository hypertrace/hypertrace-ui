import { EntityMetadataMap, ObservabilityEntityType, ObservabilityIconType } from '@hypertrace/observability';

export const entityMetadata: EntityMetadataMap = new Map([
  [
    ObservabilityEntityType.Api,
    {
      entityType: ObservabilityEntityType.Api,
      icon: ObservabilityIconType.Api,
      detailPath: (id: string, sourceRoute?: string) => [sourceRoute ?? '', 'endpoint', id],
      sourceRoutes: ['endpoints']
    }
  ],
  [
    ObservabilityEntityType.Service,
    {
      entityType: ObservabilityEntityType.Service,
      icon: ObservabilityIconType.Service,
      listPath: ['endpoints'],
      detailPath: (id: string) => ['service', id],
      apisListPath: (id: string) => ['service', id, 'endpoints'],
      typeDisplayName: 'Service'
    }
  ],
  [
    ObservabilityEntityType.Backend,
    {
      entityType: ObservabilityEntityType.Backend,
      icon: ObservabilityIconType.Backend,
      listPath: ['backends'],
      detailPath: (id: string) => ['backends', 'backend', id]
    }
  ]
]);
