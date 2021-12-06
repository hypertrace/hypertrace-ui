import { createServiceFactory } from '@ngneat/spectator/jest';
import { EntityMetadata, ENTITY_METADATA } from '../../constants/entity-metadata';
import {
  BackendType,
  entityIdKey,
  EntityType,
  entityTypeKey,
  ObservabilityEntityType
} from '../../graphql/model/schema/entity';
import { ObservabilityIconType } from '../../icons/observability-icon-type';
import { EntityIconLookupService } from './entity-icon-lookup.service';

describe('Entity Icon Lookup Service', () => {
  const serviceFactory = createServiceFactory({
    service: EntityIconLookupService,
    providers: [
      {
        provide: ENTITY_METADATA,
        useValue: new Map<string, Partial<EntityMetadata>>([
          [
            ObservabilityEntityType.Service,
            {
              icon: ObservabilityIconType.Service
            }
          ],
          [
            ObservabilityEntityType.Api,
            {
              icon: ObservabilityIconType.Api
            }
          ],
          [
            ObservabilityEntityType.Backend,
            {
              icon: ObservabilityIconType.Backend
            }
          ]
        ])
      }
    ]
  });
  test('determines correct icon type for entity types', () => {
    const service = serviceFactory().service;

    expect(service.forEntityType(ObservabilityEntityType.Service)).toBe(ObservabilityIconType.Service);
    expect(service.forEntityType(ObservabilityEntityType.Api)).toBe(ObservabilityIconType.Api);
    expect(service.forEntityType(ObservabilityEntityType.Backend)).toBe(ObservabilityIconType.Backend);
  });

  test('determines correct icon type for entities', () => {
    const service = serviceFactory().service;
    const entityOfType = (entityType: EntityType) => ({
      [entityTypeKey]: entityType,
      [entityIdKey]: 'test-id'
    });
    expect(service.forEntity(entityOfType(ObservabilityEntityType.Service))).toBe(ObservabilityIconType.Service);
    expect(service.forEntity(entityOfType(ObservabilityEntityType.Api))).toBe(ObservabilityIconType.Api);
    expect(service.forEntity(entityOfType(ObservabilityEntityType.Backend))).toBe(ObservabilityIconType.Backend);
  });

  test('determines correct icon type for backends', () => {
    const service = serviceFactory().service;

    expect(
      service.forBackendEntity({
        [entityTypeKey]: ObservabilityEntityType.Backend,
        [entityIdKey]: 'test-id'
      })
    ).toBe(ObservabilityIconType.Backend);

    expect(
      service.forBackendEntity({
        [entityTypeKey]: ObservabilityEntityType.Backend,
        [entityIdKey]: 'test-id',
        protocol: 'random'
      })
    ).toBe(ObservabilityIconType.Backend);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: 'random'
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Backend);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.AWSRDS
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.AWSRDS);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Apigee
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Apigee);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Cassandra
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Cassandra);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Elastic
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Elastic);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Helm
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Helm);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.HTTP
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.HTTP);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.JDBC
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.JDBC);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Kong
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Kong);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Kubernetes
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Kubernetes);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.MicrosoftAzure
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.MicrosoftAzure);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.MicrosoftSqlServer
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.MicrosoftSqlServer);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Mongo
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Mongo);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Mysql
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Mysql);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Oracle
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Oracle);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.PostgreSQL
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.PostgreSQL);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.RabbitMQ
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.RabbitMQ);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Redis
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Redis);

    expect(
      service.forBackendEntity(
        {
          [entityTypeKey]: ObservabilityEntityType.Backend,
          [entityIdKey]: 'test-id',
          backendType: BackendType.Tyk
        },
        'backendType'
      )
    ).toBe(ObservabilityIconType.Tyk);
  });
});
