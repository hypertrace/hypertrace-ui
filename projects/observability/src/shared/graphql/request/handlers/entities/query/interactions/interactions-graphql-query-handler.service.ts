import { Injectable } from '@angular/core';
import { DeepReadonly, forkJoinSafeEmpty, RequireBy } from '@hypertrace/common';
import {
  GraphQlSelectionBuilder,
  GraphQlTimeRange,
  MetadataService,
  Specification
} from '@hypertrace/distributed-tracing';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityType, Interaction, INTERACTION_SCOPE } from '../../../../../model/schema/entity';
import { GraphQlObservabilityArgumentBuilder } from '../../../../builders/argument/graphql-observability-argument-builder';
import { EntitiesGraphqlQueryBuilderService } from '../entities-graphql-query-builder.service';
import {
  EntityGraphQlQueryHandlerService,
  ENTITY_GQL_REQUEST,
  GraphQlEntityRequest
} from '../entity/entity-graphql-query-handler.service';

@Injectable({ providedIn: 'root' })
export class InteractionsGraphQlQueryHandlerService
  implements GraphQlQueryHandler<GraphQlInteractionsRequest, InteractionsResponse> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();
  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();

  public constructor(
    private readonly entityGraphQlQueryHandler: EntityGraphQlQueryHandlerService,
    private readonly entitiesGraphqlQueryBuilderService: EntitiesGraphqlQueryBuilderService,
    private readonly metaDataService: MetadataService
  ) {}

  public matchesRequest(request: unknown): request is GraphQlInteractionsRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlInteractionsRequest>).requestType === INTERACTIONS_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlInteractionsRequest): GraphQlSelection {
    const entitySelection = this.entityGraphQlQueryHandler.convertRequest(this.convertToEntityRequest(request));
    const entityResultSelection = this.getEntityResultSelection(entitySelection);
    entityResultSelection.children.push(this.buildEdgeSelection(request));

    return entitySelection;
  }

  public convertResponse(
    response: EntitiesServerResponse,
    request: GraphQlInteractionsRequest
  ): Observable<InteractionsResponse> {
    const edges = response.results[0].incomingEdges;

    return forkJoinSafeEmpty(edges.results.map(result => this.buildInteraction(result, request))).pipe(
      map(results => ({
        total: edges.total,
        results: results
      }))
    );
  }

  private convertToEntityRequest(request: GraphQlInteractionsRequest): GraphQlEntityRequest {
    return {
      requestType: ENTITY_GQL_REQUEST,
      id: request.entityId,
      entityType: request.entityType,
      properties: [],
      timeRange: request.timeRange
    };
  }

  private getEntityResultSelection(topLevelSelection: GraphQlSelection): RequireBy<GraphQlSelection, 'children'> {
    return topLevelSelection.children!.find(child => child.path === 'results') as RequireBy<
      GraphQlSelection,
      'children'
    >;
  }

  private buildEdgeSelection(request: GraphQlInteractionsRequest): GraphQlSelection {
    return {
      path: 'incomingEdges',
      arguments: [this.argBuilder.forNeighborType(request.neighborType)],
      children: [
        {
          path: 'results',
          children: [
            ...this.selectionBuilder.fromSpecifications(request.interactionSpecifications),
            {
              path: 'neighbor',
              children: [{ path: 'id' }, ...this.selectionBuilder.fromSpecifications(request.neighborSpecifications)]
            }
          ]
        },
        { path: 'total' }
      ]
    };
  }

  private buildInteraction(
    serverInteraction: InteractionServerResponse,
    request: GraphQlInteractionsRequest
  ): Observable<Interaction> {
    return combineLatest([
      this.entitiesGraphqlQueryBuilderService.normalizeEntity(serverInteraction.neighbor, {
        entityType: request.neighborType,
        properties: request.neighborSpecifications
      }),
      this.metaDataService.buildSpecificationResultWithUnits(
        serverInteraction,
        request.interactionSpecifications,
        INTERACTION_SCOPE
      )
    ]).pipe(
      map(([neighbor, properties]) => {
        const interaction: Interaction = {
          neighbor: neighbor
        };

        properties.forEach(property => (interaction[property.alias] = property.data));

        return interaction;
      })
    );
  }
}

export const INTERACTIONS_GQL_REQUEST = Symbol('GraphQL Interactions Request');

export interface GraphQlInteractionsRequest {
  requestType: typeof INTERACTIONS_GQL_REQUEST;
  interactionSpecifications: Specification[];
  timeRange: GraphQlTimeRange;
  entityType: EntityType;
  entityId: string;
  neighborType: EntityType;
  neighborSpecifications: Specification[];
}

export interface InteractionsResponse {
  results: Interaction[];
  total: number;
}

type EntitiesServerResponse = DeepReadonly<{
  results: [
    {
      incomingEdges: {
        results: InteractionServerResponse[];
        total: number;
      };
    }
  ];
}>;

interface InteractionServerResponse {
  [key: string]: unknown;

  neighbor: {
    id: string;
    [key: string]: unknown;
  };
}
