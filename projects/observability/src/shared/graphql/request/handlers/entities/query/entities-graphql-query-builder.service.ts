import { Inject, Injectable } from '@angular/core';
import { Dictionary, forkJoinSafeEmpty } from '@hypertrace/common';
import {
  getAggregationUnitDisplayName,
  GraphQlFilter,
  GraphQlSelectionBuilder,
  GraphQlSortBySpecification,
  GraphQlTimeRange,
  isMetricAggregation,
  isMetricSpecification,
  MetadataService,
  MetricSpecification,
  Specification
} from '@hypertrace/distributed-tracing';
import {
  GraphQlArgument,
  GraphQlRequestCacheability,
  GraphQlRequestOptions,
  GraphQlSelection
} from '@hypertrace/graphql-client';
import { Observable, of } from 'rxjs';
import { defaultIfEmpty, map } from 'rxjs/operators';
import { EntityMetadataMap, ENTITY_METADATA } from '../../../../../constants/entity-metadata';
import {
  Entity,
  entityIdKey,
  EntityType,
  entityTypeKey,
  ObservabilityEntityType
} from '../../../../model/schema/entity';
import { GraphQlEntityFilter } from '../../../../model/schema/filter/entity/graphql-entity-filter';
import { GraphQlObservabilityArgumentBuilder } from '../../../builders/argument/graphql-observability-argument-builder';
import { getApiDiscoveryStateFilter } from '../../util/handler-util';

@Injectable({ providedIn: 'root' })
export class EntitiesGraphqlQueryBuilderService {
  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();

  public constructor(
    private readonly metadataService: MetadataService,
    @Inject(ENTITY_METADATA) private readonly entityMetetadata: EntityMetadataMap
  ) {}

  public buildRequestArguments(request: GraphQlEntitiesRequest): GraphQlArgument[] {
    return [
      this.argBuilder.forEntityType(request.entityType),
      this.argBuilder.forLimit(request.limit),
      this.argBuilder.forTimeRange(request.timeRange),
      ...this.argBuilder.forOffset(request.offset),
      ...this.argBuilder.forOrderBy(request.sort),
      ...this.buildFilters(request)
    ];
  }

  private buildFilters(request: GraphQlEntitiesRequest): GraphQlArgument[] {
    if (request.entityType !== ObservabilityEntityType.Api) {
      return this.argBuilder.forFilters(request.filters);
    }

    // For API Entity
    const filters = request.filters !== undefined ? [...request.filters] : [];

    // Check if ID filter is applied.
    const hasApiEntityFilter = filters.some(
      filter => filter instanceof GraphQlEntityFilter && filter.id && filter.type === ObservabilityEntityType.Api
    );

    if (!hasApiEntityFilter) {
      // Apply a filter on discovery state
      filters.push(getApiDiscoveryStateFilter());
    }

    return this.argBuilder.forFilters(filters);
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
    return forkJoinSafeEmpty(
      request.properties.map(spec => {
        const alias = spec.resultAlias();
        const data = spec.extractFromServerData(rawResult);

        if (isMetricSpecification(spec) && isMetricAggregation(data)) {
          return this.resultUnits(request.entityType, spec).pipe(
            map(units => ({
              alias: alias,
              data: { units: units, ...(data as object) }
            }))
          );
        }

        return of({
          alias: alias,
          data: data
        });
      })
    ).pipe(
      map(results => {
        const entity: Entity = {
          [entityIdKey]: rawResult.id as string,
          [entityTypeKey]: request.entityType
        };

        results.forEach(result => (entity[result.alias] = result.data));

        return entity;
      })
    );
  }

  public resultUnits(scope: string, specification: MetricSpecification): Observable<string> {
    return this.metadataService.getAttribute(scope, specification.name).pipe(
      map(attribute => getAggregationUnitDisplayName(attribute, specification.aggregation)),
      defaultIfEmpty('') // FIXME: getAttribute() will complete if it can't find any attribute
    );
  }

  public getRequestOptions(request: Pick<GraphQlEntitiesRequest, 'entityType'>): GraphQlRequestOptions {
    if (this.entityMetetadata.get(request.entityType)?.volatile) {
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
