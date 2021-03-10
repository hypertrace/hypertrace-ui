import { Injectable } from '@angular/core';
import { DateCoercer, Dictionary, TimeDuration } from '@hypertrace/common';
import {
  GlobalGraphQlFilterService,
  GraphQlFilter,
  GraphQlSelectionBuilder,
  GraphQlSortBySpecification,
  GraphQlTimeRange
} from '@hypertrace/distributed-tracing';
import {
  GraphQlEnumArgument,
  GraphQlHandlerType,
  GraphQlQueryHandler,
  GraphQlSelection
} from '@hypertrace/graphql-client';
import { INTERVAL_START_QUERY_KEY } from '../../../model/schema/explore';
import { GraphQlGroupBy } from '../../../model/schema/groupby/graphql-group-by';
import { ExploreSpecification, ExploreValue } from '../../../model/schema/specifications/explore-specification';
import { GraphQlObservabilityArgumentBuilder } from '../../builders/argument/graphql-observability-argument-builder';
import { ExploreSpecificationBuilder } from '../../builders/specification/explore/explore-specification-builder';

export const GQL_EXPLORE_RESULT_INTERVAL_KEY = Symbol('Interval Start');
@Injectable({ providedIn: 'root' })
export class ExploreGraphQlQueryHandlerService
  implements GraphQlQueryHandler<GraphQlExploreRequest, GraphQlExploreResponse> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();
  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public constructor(private readonly globalGraphQlFilterService: GlobalGraphQlFilterService) {}

  public matchesRequest(request: unknown): request is GraphQlExploreRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlExploreRequest>).requestType === EXPLORE_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlExploreRequest): GraphQlSelection {
    const totalSelection = request.includeTotal ? [{ path: 'total' }] : [];

    return {
      path: 'explore',
      arguments: [
        {
          name: 'context',
          value: new GraphQlEnumArgument(request.context)
        },
        this.argBuilder.forLimit(request.limit),
        this.argBuilder.forTimeRange(request.timeRange),
        ...this.argBuilder.forOffset(request.offset),
        ...this.argBuilder.forInterval(request.interval),
        ...this.argBuilder.forFilters(
          this.globalGraphQlFilterService.mergeGlobalFilters(request.context, request.filters)
        ),
        ...this.argBuilder.forGroupBy(request.groupBy),
        ...this.argBuilder.forOrderBys(request.orderBy)
      ],
      children: [
        {
          path: 'results',
          children: [
            ...this.getAnyIntervalSelections(request),
            ...this.selectionBuilder.fromSpecifications(this.groupByAsSpecifications(request.groupBy)),
            ...this.selectionBuilder.fromSpecifications(request.selections)
          ]
        },
        ...totalSelection
      ]
    };
  }

  public convertResponse(
    response: GraphQlExploreServerResponse,
    request: GraphQlExploreRequest
  ): GraphQlExploreResponse {
    return {
      total: response.total,
      results: response.results.map(result => this.convertResultRow(result, request))
    };
  }

  private convertResultRow(row: GraphQlExploreServerResult, request: GraphQlExploreRequest): GraphQlExploreResult {
    return {
      ...this.getIntervalResultFragment(row, request),
      ...this.getSelectionResultFragment(row, this.groupByAsSpecifications(request.groupBy)),
      ...this.getSelectionResultFragment(row, request.selections)
    };
  }

  private getIntervalResultFragment(
    row: GraphQlExploreServerResult,
    request: GraphQlExploreRequest
  ): Pick<GraphQlExploreResult, typeof GQL_EXPLORE_RESULT_INTERVAL_KEY> {
    if (request.interval) {
      return {
        [GQL_EXPLORE_RESULT_INTERVAL_KEY]: this.dateCoercer.coerce(row[INTERVAL_START_QUERY_KEY])
      };
    }

    return {};
  }

  private getSelectionResultFragment(
    row: GraphQlExploreServerResult,
    specifications: ExploreSpecification[]
  ): Pick<GraphQlExploreResult, string> {
    return Object.assign(
      {},
      ...specifications.map(specification => ({
        [specification.resultAlias()]: specification.extractFromServerData(row as Dictionary<GraphQlExploreResultValue>)
      }))
    );
  }

  private getAnyIntervalSelections(request: GraphQlExploreRequest): GraphQlSelection[] {
    return request.interval ? [{ path: 'intervalStart', alias: INTERVAL_START_QUERY_KEY }] : [];
  }

  private groupByAsSpecifications(groupBy?: GraphQlGroupBy): ExploreSpecification[] {
    return (groupBy?.keys ?? []).map(key => this.specBuilder.exploreSpecificationForKey(key));
  }
}

export const EXPLORE_GQL_REQUEST = Symbol('GraphQL Query Request');

export interface GraphQlExploreRequest {
  requestType: typeof EXPLORE_GQL_REQUEST;
  selections: ExploreSpecification[];
  context: string; // Scope of Request. Example: Trace, Span
  limit: number;
  timeRange: GraphQlTimeRange;
  offset?: number;
  includeTotal?: boolean;
  interval?: TimeDuration;
  orderBy?: GraphQlSortBySpecification[];
  filters?: GraphQlFilter[];
  groupBy?: GraphQlGroupBy;
}

export interface GraphQlExploreResponse {
  total?: number;
  results: GraphQlExploreResult[];
}

export interface GraphQlExploreResult {
  [GQL_EXPLORE_RESULT_INTERVAL_KEY]?: Date;

  [key: string]: GraphQlExploreResultValue;
}

type GraphQlExploreValueType = number | string | boolean | undefined;

export interface GraphQlExploreResultValue extends ExploreValue<GraphQlExploreValueType> {
  units?: string;
}

interface GraphQlExploreServerResponse {
  total?: number;
  results: GraphQlExploreServerResult[];
}

interface GraphQlExploreServerResult {
  [INTERVAL_START_QUERY_KEY]?: string;

  [key: string]: GraphQlExploreResultValue | string | undefined;
}
