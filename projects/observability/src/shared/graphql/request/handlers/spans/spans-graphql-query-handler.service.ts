import { Injectable } from '@angular/core';
import { Dictionary, forkJoinSafeEmpty } from '@hypertrace/common';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { GlobalGraphQlFilterService } from '../../../model/schema/filter/global-graphql-filter.service';
import { GraphQlFilter } from '../../../model/schema/filter/graphql-filter';
import { GraphQlSortBySpecification } from '../../../model/schema/sort/graphql-sort-by-specification';
import { Span, spanIdKey, SPAN_SCOPE } from '../../../model/schema/span';
import { Specification } from '../../../model/schema/specifier/specification';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { GraphQlArgumentBuilder } from '../../builders/argument/graphql-argument-builder';
import { GraphQlSelectionBuilder } from '../../builders/selections/graphql-selection-builder';

@Injectable({ providedIn: 'root' })
export class SpansGraphQlQueryHandlerService implements GraphQlQueryHandler<GraphQlSpansRequest, SpansResponse> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();

  public constructor(
    private readonly metadataService: MetadataService,
    private readonly globalGraphQlFilterService: GlobalGraphQlFilterService
  ) {}

  public matchesRequest(request: unknown): request is GraphQlSpansRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlSpansRequest>).requestType === SPANS_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlSpansRequest): GraphQlSelection {
    return {
      path: 'spans',
      arguments: [
        this.argBuilder.forLimit(request.limit),
        this.argBuilder.forTimeRange(request.timeRange),
        ...this.argBuilder.forOffset(request.offset),
        ...this.argBuilder.forOrderBy(request.sort),
        ...this.argBuilder.forFilters(this.globalGraphQlFilterService.mergeGlobalFilters(SPAN_SCOPE, request.filters))
      ],
      children: [
        {
          path: 'results',
          children: [{ path: 'id' }, ...this.selectionBuilder.fromSpecifications(request.properties)]
        },
        {
          path: 'total'
        }
      ]
    };
  }

  public convertResponse(response: unknown, request: GraphQlSpansRequest): Observable<SpansResponse> {
    const typedResponse = response as SpansServerResponse;

    return forkJoinSafeEmpty(typedResponse.results.map(spanResult => this.normalizeSpan(spanResult, request))).pipe(
      map(results => ({
        total: typedResponse.total,
        results: results
      }))
    );
  }

  private normalizeSpan(rawResult: Dictionary<unknown>, request: GraphQlSpansRequest): Observable<Span> {
    return forkJoinSafeEmpty(
      request.properties.map(spec => {
        const alias = spec.resultAlias();
        const data = spec.extractFromServerData(rawResult);

        return this.resultUnits(spec).pipe(
          map(units => ({
            alias: alias,
            data: units !== undefined && !this.hasUnits(data) ? { units: units, value: data } : data
          }))
        );
      })
    ).pipe(
      map(results => {
        const span: Span = {
          [spanIdKey]: rawResult.id as string
        };

        results.forEach(result => (span[result.alias] = result.data));

        return span;
      })
    );
  }

  private hasUnits(data: unknown): boolean {
    return typeof data === 'object' && data !== null && data.hasOwnProperty('units');
  }

  private resultUnits(specification: Specification): Observable<string | undefined> {
    return this.metadataService
      .getAttribute(SPAN_SCOPE, specification.name)
      .pipe(map(attribute => (attribute.units !== '' ? attribute.units : undefined)));
  }
}

export const SPANS_GQL_REQUEST = Symbol('GraphQL Spans Request');

export interface GraphQlSpansRequest {
  requestType: typeof SPANS_GQL_REQUEST;
  properties: Specification[];
  timeRange: GraphQlTimeRange;
  limit: number;
  offset?: number;
  sort?: GraphQlSortBySpecification;
  filters?: GraphQlFilter[];
}

export interface SpansResponse {
  results: Span[];
  total: number;
}

export interface SpansServerResponse {
  results: Dictionary<unknown>[];
  total: number;
}
