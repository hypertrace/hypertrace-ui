import { Inject, Injectable } from '@angular/core';
import { Dictionary, forkJoinSafeEmpty } from '@hypertrace/common';
import {
  GraphQlArgument,
  GraphQlRequestCacheability,
  GraphQlRequestOptions,
  GraphQlSelection
} from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityMetadataMap, ENTITY_METADATA } from '../../../../../constants/entity-metadata';
import { MetadataService } from '../../../../../services/metadata/metadata.service';
import { Entity, entityIdKey, EntityType, entityTypeKey } from '../../../../model/schema/entity';
import { GlobalGraphQlFilterService } from '../../../../model/schema/filter/global-graphql-filter.service';
import { GraphQlFilter } from '../../../../model/schema/filter/graphql-filter';
import { GraphQlSortBySpecification } from '../../../../model/schema/sort/graphql-sort-by-specification';
import { Specification } from '../../../../model/schema/specifier/specification';
import { GraphQlTimeRange } from '../../../../model/schema/timerange/graphql-time-range';
import { GraphQlObservabilityArgumentBuilder } from '../../../builders/argument/graphql-observability-argument-builder';
import { GraphQlSelectionBuilder } from '../../../builders/selections/graphql-selection-builder';

@Injectable({ providedIn: 'root' })
export class EntitiesGraphqlQueryBuilderService {
  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();

  public constructor(
    private readonly metadataService: MetadataService,
    private readonly globalGraphQlFilterService: GlobalGraphQlFilterService,
    @Inject(ENTITY_METADATA) private readonly entityMetadata: EntityMetadataMap
  ) {}

  public buildRequestArguments(request: GraphQlEntitiesRequest): GraphQlArgument[] {
    return [
      this.argBuilder.forScope(request.entityType),
      this.argBuilder.forLimit(request.limit),
      this.argBuilder.forTimeRange(request.timeRange),
      ...this.argBuilder.forOffset(request.offset),
      ...this.argBuilder.forOrderBy(request.sort),
      ...this.buildFilters(request),
      ...this.argBuilder.forIncludeInactive(request.includeInactive)
    ];
  }

  protected buildFilters(request: GraphQlEntitiesRequest): GraphQlArgument[] {
    return this.argBuilder.forFilters(
      this.globalGraphQlFilterService.mergeGlobalFilters(request.entityType, request.filters)
    );
  }

  public buildRequestSpecifications(request: GraphQlEntitiesRequest): GraphQlSelection[] {
    return this.selectionBuilder.fromSpecifications(request.properties);
  }

  public buildResponse(response: unknown, request: GraphQlEntitiesRequest): Observable<EntitiesResponse> {
    const typedResponse = response as EntitiesServerResponse;

    return forkJoinSafeEmpty(
      typedResponse.results.map(entityResult => this.normalizeEntity(entityResult, request))
    ).pipe(
      map(results => ({
        total: typedResponse.total,
        results: results
      }))
    );
  }

  public normalizeEntity(rawResult: Dictionary<unknown>, request: EntityDescriptor): Observable<Entity> {
    return this.metadataService
      .buildSpecificationResultWithUnits(rawResult, request.properties, request.entityType)
      .pipe(
        map(mappedResult => {
          const entity: Entity = {
            [entityIdKey]: rawResult.id as string,
            [entityTypeKey]: request.entityType
          };

          mappedResult.forEach((data, specification) => {
            entity[specification.resultAlias()] = data;
          });

          return entity;
        })
      );
  }

  public getRequestOptions(request: Pick<GraphQlEntitiesRequest, 'entityType'>): GraphQlRequestOptions {
    if (this.entityMetadata.get(request.entityType)?.volatile) {
      return { cacheability: GraphQlRequestCacheability.NotCacheable };
    }

    return { cacheability: GraphQlRequestCacheability.Cacheable };
  }
}

export interface GraphQlEntitiesRequest {
  timeRange: GraphQlTimeRange;
  entityType: EntityType;
  properties: Specification[];
  limit: number;
  offset?: number;
  sort?: GraphQlSortBySpecification;
  filters?: GraphQlFilter[];
  includeTotal?: boolean;
  includeInactive?: boolean;
}

export interface EntitiesResponse {
  results: Entity[];
  total?: number;
}

interface EntitiesServerResponse {
  total?: number;
  results: Dictionary<unknown>[];
}

type EntityDescriptor = Pick<GraphQlEntitiesRequest, 'entityType' | 'properties'>;
