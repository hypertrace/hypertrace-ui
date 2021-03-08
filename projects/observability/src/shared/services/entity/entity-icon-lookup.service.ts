import { Inject, Injectable } from '@angular/core';
import { EntityMetadataMap, ENTITY_METADATA } from '../../constants/entity-metadata';
import {
  BackendType,
  Entity,
  EntityType,
  entityTypeKey,
  ObservabilityEntityType
} from '../../graphql/model/schema/entity';
import { ObservabilityIconType } from '../../icons/observability-icon-type';

@Injectable({ providedIn: 'root' })
export class EntityIconLookupService {
  public constructor(@Inject(ENTITY_METADATA) private readonly entityMetadata: EntityMetadataMap) {}
  // TODO allow resolvable entity icon lookup registration to move the backend stuff out
  public forEntity(entity: Entity): string {
    switch (entity[entityTypeKey]) {
      case ObservabilityEntityType.Backend:
        return this.forBackendEntity(entity as Entity<ObservabilityEntityType.Backend>);
      default:
        return this.forEntityType(entity[entityTypeKey]);
    }
  }

  public forEntityType(entityType: EntityType): string {
    switch (entityType) {
      case ObservabilityEntityType.Backend:
        return this.forBackendType();
      default:
        return this.entityMetadata.get(entityType)?.icon ?? '';
    }
  }

  public forBackendEntity(entity: Entity<ObservabilityEntityType.Backend>, backendTypeKey: string = 'type'): string {
    return this.forBackendType(entity[backendTypeKey] as string | undefined);
  }

  public forBackendType(backendType?: string): string {
    switch (backendType) {
      case BackendType.AWS:
        return ObservabilityIconType.AWS;

      case BackendType.AWSRDS:
        return ObservabilityIconType.AWSRDS;

      case BackendType.Apigee:
        return ObservabilityIconType.Apigee;

      case BackendType.Cassandra:
        return ObservabilityIconType.Cassandra;

      case BackendType.Elastic:
        return ObservabilityIconType.Elastic;

      case BackendType.Helm:
        return ObservabilityIconType.Helm;

      case BackendType.HTTP:
        return ObservabilityIconType.HTTP;

      case BackendType.JDBC:
        return ObservabilityIconType.JDBC;

      case BackendType.KAFKA:
        return ObservabilityIconType.Kafka;

      case BackendType.Kong:
        return ObservabilityIconType.Kong;

      case BackendType.Kubernetes:
        return ObservabilityIconType.Kubernetes;

      case BackendType.MicrosoftAzure:
        return ObservabilityIconType.MicrosoftAzure;

      case BackendType.MicrosoftSqlServer:
        return ObservabilityIconType.MicrosoftSqlServer;

      case BackendType.Mongo:
        return ObservabilityIconType.Mongo;

      case BackendType.Mysql:
        return ObservabilityIconType.Mysql;

      case BackendType.Oracle:
        return ObservabilityIconType.Oracle;

      case BackendType.PostgreSQL:
        return ObservabilityIconType.PostgreSQL;

      case BackendType.RabbitMQ:
        return ObservabilityIconType.RabbitMQ;

      case BackendType.Redis:
        return ObservabilityIconType.Redis;

      case BackendType.SQS:
        return ObservabilityIconType.SQS;

      case BackendType.Tyk:
        return ObservabilityIconType.Tyk;

      default:
        return ObservabilityIconType.Backend;
    }
  }
}
