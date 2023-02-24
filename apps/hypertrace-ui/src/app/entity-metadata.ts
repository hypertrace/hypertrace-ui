import { EntityMetadataMap, ObservabilityEntityType, ObservabilityIconType } from '@hypertrace/observability';

export const entityMetadata: EntityMetadataMap = new Map([
  [
    ObservabilityEntityType.Api,
    {
      entityType: ObservabilityEntityType.Api,
      icon: ObservabilityIconType.Api,
      detailPath: (id: string, sourceRoute?: string) => [sourceRoute ?? 'endpoints', 'endpoint', id],
      sourceRoutes: ['services'],
      listPath: ['endpoints'],
      typeDisplayName: 'Endpoint'
    }
  ],
  [
    ObservabilityEntityType.Service,
    {
      entityType: ObservabilityEntityType.Service,
      icon: ObservabilityIconType.Service,
      detailPath: (id: string) => ['services', 'service', id],
      listPath: ['services'],
      apisListPath: (id: string) => ['services', 'service', id, 'endpoints'],
      typeDisplayName: 'Service'
    }
  ],
  [
    ObservabilityEntityType.Backend,
    {
      entityType: ObservabilityEntityType.Backend,
      icon: ObservabilityIconType.Backend,
      detailPath: (id: string) => ['backends', 'backend', id],
      listPath: ['backends']
    }
  ]
]);
