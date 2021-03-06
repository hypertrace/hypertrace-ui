import { Injectable } from '@angular/core';
import { GraphQlTimeRange, Specification } from '@hypertrace/distributed-tracing';
import {
  GraphQlHandlerType,
  GraphQlQueryHandler,
  GraphQlRequestCacheability,
  GraphQlRequestOptions,
  GraphQlSelection,
  MutationTrackerService
} from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map, throwIfEmpty } from 'rxjs/operators';
import { Entity, EntityType, ObservabilityEntityType } from '../../../../../model/schema/entity';
import { GraphQlEntityFilter } from '../../../../../model/schema/filter/entity/graphql-entity-filter';
import { EntitiesGraphqlQueryBuilderService } from '../entities-graphql-query-builder.service';
import {
  EntitiesGraphQlQueryHandlerService,
  ENTITIES_GQL_REQUEST,
  EntityMutationType,
  GraphQlEntitiesQueryRequest
} from '../entities-graphql-query-handler.service';

@Injectable({ providedIn: 'root' })
export class EntityGraphQlQueryHandlerService implements GraphQlQueryHandler<GraphQlEntityRequest, Entity | undefined> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  public constructor(
    private readonly entitiesGraphQlQueryHandler: EntitiesGraphQlQueryHandlerService,
    private readonly entityGraphQlQueryBuilder: EntitiesGraphqlQueryBuilderService,
    private readonly mutationTrackerService: MutationTrackerService
  ) {}

  public matchesRequest(request: unknown): request is GraphQlEntityRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlEntityRequest>).requestType === ENTITY_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlEntityRequest): GraphQlSelection {
    return this.entitiesGraphQlQueryHandler.convertRequest(this.asEntitiesRequest(request));
  }

  public convertResponse(response: unknown, request: GraphQlEntityRequest): Observable<Entity | undefined> {
    this.mutationTrackerService.markMutationAsConsumed(EntityMutationType, request.id);

    return this.entitiesGraphQlQueryHandler.convertResponse(response, this.asEntitiesRequest(request)).pipe(
      map(results => results.results[0]),
      throwIfEmpty(() => new Error('No Entity found'))
    );
  }

  public getRequestOptions(request: GraphQlEntityRequest): GraphQlRequestOptions {
    if (this.mutationTrackerService.isAffectedByMutation(EntityMutationType, request.id)) {
      return { cacheability: GraphQlRequestCacheability.RefreshCache };
    }

    return this.entityGraphQlQueryBuilder.getRequestOptions(request);
  }

  private asEntitiesRequest(request: GraphQlEntityRequest): GraphQlEntitiesQueryRequest {
    return {
      requestType: ENTITIES_GQL_REQUEST,
      entityType: request.entityType,
      limit: 1,
      timeRange: request.timeRange,
      properties: request.properties,
      filters: [new GraphQlEntityFilter(request.id, request.entityType)],
      // If querying for a single API, then always want to includeInactive
      includeInactive: request.entityType === ObservabilityEntityType.Api
    };
  }
}

export const ENTITY_GQL_REQUEST = Symbol('GraphQL Entity Request');

export interface GraphQlEntityRequest {
  requestType: typeof ENTITY_GQL_REQUEST;
  entityType: EntityType;
  id: string;
  properties: Specification[];
  timeRange: GraphQlTimeRange;
}
