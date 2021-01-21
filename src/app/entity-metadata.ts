import { EntityMetadataMap, ObservabilityEntityType, ObservabilityIconType } from '@hypertrace/observability';

export const entityMetadata: EntityMetadataMap = new Map([
  [
    ObservabilityEntityType.Api,
    {
      entityType: ObservabilityEntityType.Api,
      icon: ObservabilityIconType.Api,
      detailPath: (id: string, sourceRoute?: string) => [sourceRoute ?? '', 'endpoint', id],
      sourceRoutes: ['apis']
    }
  ],
  [
    ObservabilityEntityType.Service,
    {
      entityType: ObservabilityEntityType.Service,
      icon: ObservabilityIconType.Service,
      detailPath: (id: string) => ['apis', 'service', id],
      listPath: ['apis'],
      apisListPath: (id: string) => ['apis', 'service', id, 'endpoints'],
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
